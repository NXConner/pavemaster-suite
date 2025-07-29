#!/bin/bash

# PaveMaster Suite Monitoring and Observability Setup
# This script sets up monitoring, logging, and observability tools

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Setup application monitoring
setup_application_monitoring() {
    log_info "Setting up application monitoring..."
    
    # Create monitoring configuration
    cat > monitoring/app-monitoring.yml << EOF
# Application Performance Monitoring Configuration
apiVersion: v1
kind: ConfigMap
metadata:
  name: pavemaster-monitoring
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
      evaluation_interval: 15s
    
    rule_files:
      - "pavemaster-alerts.yml"
    
    scrape_configs:
      - job_name: 'pavemaster-app'
        static_configs:
          - targets: ['localhost:3000']
        metrics_path: '/api/metrics'
        scrape_interval: 10s
      
      - job_name: 'pavemaster-api'
        static_configs:
          - targets: ['localhost:8000']
        metrics_path: '/metrics'
        scrape_interval: 10s
      
      - job_name: 'supabase-metrics'
        static_configs:
          - targets: ['localhost:9187']
        scrape_interval: 30s

    alerting:
      alertmanagers:
        - static_configs:
            - targets:
              - alertmanager:9093

  pavemaster-alerts.yml: |
    groups:
    - name: pavemaster-alerts
      rules:
      - alert: HighResponseTime
        expr: http_request_duration_seconds{quantile="0.95"} > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time detected"
          description: "95th percentile response time is {{ \$value }}s"
      
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ \$value }} errors per second"
      
      - alert: DatabaseConnectionFailures
        expr: increase(database_connection_errors_total[5m]) > 5
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Database connection failures"
          description: "{{ \$value }} database connection failures in the last 5 minutes"
      
      - alert: HighMemoryUsage
        expr: process_resident_memory_bytes / 1024 / 1024 > 512
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"
          description: "Memory usage is {{ \$value }}MB"
EOF
    
    log_success "Application monitoring configuration created"
}

# Setup logging
setup_logging() {
    log_info "Setting up centralized logging..."
    
    # Create logging configuration
    cat > monitoring/logging.yml << EOF
# Centralized Logging Configuration
version: '3.8'
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.8.0
    environment:
      - discovery.type=single-node
      - ES_JAVA_OPTS=-Xms512m -Xmx512m
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    networks:
      - monitoring

  kibana:
    image: docker.elastic.co/kibana/kibana:8.8.0
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch
    networks:
      - monitoring

  logstash:
    image: docker.elastic.co/logstash/logstash:8.8.0
    volumes:
      - ./logstash/pipeline:/usr/share/logstash/pipeline
      - ./logstash/config:/usr/share/logstash/config
    ports:
      - "5044:5044"
      - "9600:9600"
    depends_on:
      - elasticsearch
    networks:
      - monitoring

  filebeat:
    image: docker.elastic.co/beats/filebeat:8.8.0
    user: root
    volumes:
      - ./filebeat/filebeat.yml:/usr/share/filebeat/filebeat.yml:ro
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
    depends_on:
      - logstash
    networks:
      - monitoring

volumes:
  elasticsearch_data:

networks:
  monitoring:
    driver: bridge
EOF

    # Create Filebeat configuration
    mkdir -p monitoring/filebeat
    cat > monitoring/filebeat/filebeat.yml << EOF
filebeat.inputs:
- type: container
  paths:
    - '/var/lib/docker/containers/*/*.log'
  processors:
  - add_docker_metadata:
      host: "unix:///var/run/docker.sock"

output.logstash:
  hosts: ["logstash:5044"]

logging.level: info
logging.to_files: true
logging.files:
  path: /var/log/filebeat
  name: filebeat
  keepfiles: 7
  permissions: 0644
EOF

    # Create Logstash pipeline
    mkdir -p monitoring/logstash/pipeline
    cat > monitoring/logstash/pipeline/logstash.conf << EOF
input {
  beats {
    port => 5044
  }
}

filter {
  if [fields][logtype] == "pavemaster" {
    grok {
      match => { "message" => "%{TIMESTAMP_ISO8601:timestamp} %{LOGLEVEL:level} %{GREEDYDATA:message}" }
    }
    
    date {
      match => [ "timestamp", "ISO8601" ]
    }
    
    if [level] == "ERROR" {
      mutate {
        add_tag => [ "error" ]
      }
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "pavemaster-logs-%{+YYYY.MM.dd}"
  }
  
  stdout {
    codec => rubydebug
  }
}
EOF

    log_success "Centralized logging configuration created"
}

# Setup metrics collection
setup_metrics() {
    log_info "Setting up metrics collection..."
    
    # Create Grafana dashboard configuration
    mkdir -p monitoring/grafana/dashboards
    cat > monitoring/grafana/dashboards/pavemaster-dashboard.json << EOF
{
  "dashboard": {
    "id": null,
    "title": "PaveMaster Suite Dashboard",
    "tags": ["pavemaster"],
    "timezone": "browser",
    "panels": [
      {
        "id": 1,
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{endpoint}}"
          }
        ],
        "yAxes": [
          {
            "label": "Requests/sec"
          }
        ]
      },
      {
        "id": 2,
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          },
          {
            "expr": "histogram_quantile(0.50, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "50th percentile"
          }
        ],
        "yAxes": [
          {
            "label": "Seconds"
          }
        ]
      },
      {
        "id": 3,
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m])",
            "legendFormat": "5xx errors"
          },
          {
            "expr": "rate(http_requests_total{status=~\"4..\"}[5m])",
            "legendFormat": "4xx errors"
          }
        ]
      },
      {
        "id": 4,
        "title": "Active Users",
        "type": "stat",
        "targets": [
          {
            "expr": "active_users_total",
            "legendFormat": "Active Users"
          }
        ]
      },
      {
        "id": 5,
        "title": "Database Connections",
        "type": "graph",
        "targets": [
          {
            "expr": "database_connections_active",
            "legendFormat": "Active"
          },
          {
            "expr": "database_connections_idle",
            "legendFormat": "Idle"
          }
        ]
      },
      {
        "id": 6,
        "title": "Memory Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "process_resident_memory_bytes / 1024 / 1024",
            "legendFormat": "Memory (MB)"
          }
        ]
      }
    ],
    "time": {
      "from": "now-1h",
      "to": "now"
    },
    "refresh": "5s"
  }
}
EOF

    log_success "Metrics collection configuration created"
}

# Setup health checks
setup_health_checks() {
    log_info "Setting up health checks..."
    
    cat > monitoring/health-checks.yml << EOF
# Health Check Configuration
version: '3.8'
services:
  healthcheck-service:
    image: alpine:latest
    command: |
      sh -c '
        while true; do
          # Application health check
          if curl -f http://app:80/health > /dev/null 2>&1; then
            echo "$(date): Application is healthy"
          else
            echo "$(date): Application health check failed"
          fi
          
          # Database health check
          if nc -z postgres 5432; then
            echo "$(date): Database is healthy"
          else
            echo "$(date): Database health check failed"
          fi
          
          # Redis health check
          if nc -z redis 6379; then
            echo "$(date): Redis is healthy"
          else
            echo "$(date): Redis health check failed"
          fi
          
          sleep 30
        done
      '
    depends_on:
      - app
      - postgres
      - redis
    networks:
      - monitoring
EOF

    log_success "Health checks configuration created"
}

# Setup alerting
setup_alerting() {
    log_info "Setting up alerting..."
    
    cat > monitoring/alertmanager.yml << EOF
# Alertmanager Configuration
global:
  smtp_smarthost: 'localhost:587'
  smtp_from: 'alerts@pavemaster.com'

route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'web.hook'

receivers:
- name: 'web.hook'
  email_configs:
  - to: 'admin@pavemaster.com'
    subject: 'PaveMaster Alert: {{ .GroupLabels.alertname }}'
    body: |
      {{ range .Alerts }}
      Alert: {{ .Annotations.summary }}
      Description: {{ .Annotations.description }}
      {{ end }}
  
  slack_configs:
  - api_url: '{{ .SlackWebhookURL }}'
    channel: '#alerts'
    title: 'PaveMaster Alert'
    text: '{{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'

inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'dev', 'instance']
EOF

    log_success "Alerting configuration created"
}

# Create monitoring directory structure
create_monitoring_structure() {
    log_info "Creating monitoring directory structure..."
    
    mkdir -p monitoring/{grafana,prometheus,alertmanager,logstash,filebeat}
    mkdir -p monitoring/grafana/{dashboards,provisioning}
    mkdir -p monitoring/logstash/{config,pipeline}
    
    log_success "Monitoring directory structure created"
}

# Main setup function
main() {
    log_info "Setting up monitoring and observability for PaveMaster Suite..."
    
    create_monitoring_structure
    setup_application_monitoring
    setup_logging
    setup_metrics
    setup_health_checks
    setup_alerting
    
    log_success "Monitoring and observability setup completed!"
    log_info "To start monitoring services, run: docker-compose -f monitoring/logging.yml up -d"
    log_info "Grafana will be available at: http://localhost:3000"
    log_info "Kibana will be available at: http://localhost:5601"
    log_info "Prometheus will be available at: http://localhost:9090"
}

# Run main function
main "$@"