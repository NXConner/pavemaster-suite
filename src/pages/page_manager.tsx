import React, { lazy, Suspense } from 'react';
import { 
    BrowserRouter as Router, 
    Route, 
    Switch, 
    RouteProps, 
    Redirect 
} from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    performanceMonitor, 
    securityManager, 
    accessibilityEnhancer 
} from '../lib/system-integrations';

// Dynamic page imports with performance optimization
const pages = {
    AIHub: lazy(() => import('./AIHub')),
    Analytics: lazy(() => import('./Analytics')),
    Auth: lazy(() => import('./Auth')),
    CompanyResources: lazy(() => import('./CompanyResources')),
    EquipmentManagement: lazy(() => import('./EquipmentManagement')),
    FinancialManagement: lazy(() => import('./FinancialManagement')),
    FleetManagement: lazy(() => import('./FleetManagement')),
    Index: lazy(() => import('./Index')),
    Measurements: lazy(() => import('./Measurements')),
    Mobile: lazy(() => import('./Mobile')),
    NotFound: lazy(() => import('./NotFound')),
    ParkingLotDesigner: lazy(() => import('./ParkingLotDesigner')),
    PhotoReports: lazy(() => import('./PhotoReports')),
    Projects: lazy(() => import('./Projects')),
    SafetyManagement: lazy(() => import('./SafetyManagement')),
    SchedulingSystem: lazy(() => import('./SchedulingSystem')),
    Settings: lazy(() => import('./Settings')),
    TeamManagement: lazy(() => import('./TeamManagement')),
    Tracking: lazy(() => import('./Tracking')),
    VeteranResources: lazy(() => import('./VeteranResources'))
};

interface EnhancedRouteProps extends RouteProps {
    requiredPermissions?: string[];
    performanceThreshold?: number;
    accessibilityEnhanced?: boolean;
}

const EnhancedRoute: React.FC<EnhancedRouteProps> = ({
    component: Component,
    requiredPermissions = [],
    performanceThreshold = 1000,
    accessibilityEnhanced = true,
    ...rest
}) => {
    const renderRoute = (props: any) => {
        // Performance monitoring
        const startTime = performance.now();

        // Security check
        if (!securityManager.hasPermissions(requiredPermissions)) {
            return <Redirect to="/unauthorized" />;
        }

        // Lazy-loaded component with error boundary
        const PageComponent = Component ? (
            <ErrorBoundary 
                fallbackRender={({ error }) => (
                    <div>
                        <h1>Page Error</h1>
                        <p>{error.message}</p>
                    </div>
                )}
            >
                <Suspense fallback={<div>Loading...</div>}>
                    {accessibilityEnhanced 
                        ? accessibilityEnhancer.enhance(Component) 
                        : <Component {...props} />}
                </Suspense>
            </ErrorBoundary>
        ) : null;

        // Performance tracking
        const endTime = performance.now();
        const renderDuration = endTime - startTime;

        if (renderDuration > performanceThreshold) {
            performanceMonitor.logSlowRender({
                route: rest.path,
                duration: renderDuration
            });
        }

        return PageComponent;
    };

    return <Route {...rest} render={renderRoute} />;
};

const PageManager: React.FC = () => {
    const pageRoutes: EnhancedRouteProps[] = [
        {
            path: '/',
            exact: true,
            component: pages.Index,
            requiredPermissions: ['public']
        },
        {
            path: '/ai-hub',
            component: pages.AIHub,
            requiredPermissions: ['admin', 'analyst']
        },
        {
            path: '/analytics',
            component: pages.Analytics,
            requiredPermissions: ['admin', 'analyst'],
            performanceThreshold: 800
        },
        {
            path: '/auth',
            component: pages.Auth,
            requiredPermissions: ['public']
        },
        {
            path: '/company-resources',
            component: pages.CompanyResources,
            requiredPermissions: ['admin', 'employee']
        },
        {
            path: '/equipment-management',
            component: pages.EquipmentManagement,
            requiredPermissions: ['admin', 'operations']
        },
        {
            path: '/financial-management',
            component: pages.FinancialManagement,
            requiredPermissions: ['admin', 'finance']
        },
        {
            path: '/fleet-management',
            component: pages.FleetManagement,
            requiredPermissions: ['admin', 'operations']
        },
        {
            path: '/measurements',
            component: pages.Measurements,
            requiredPermissions: ['admin', 'field-crew']
        },
        {
            path: '/mobile',
            component: pages.Mobile,
            requiredPermissions: ['field-crew']
        },
        {
            path: '/parking-lot-designer',
            component: pages.ParkingLotDesigner,
            requiredPermissions: ['admin', 'sales']
        },
        {
            path: '/photo-reports',
            component: pages.PhotoReports,
            requiredPermissions: ['admin', 'field-crew']
        },
        {
            path: '/projects',
            component: pages.Projects,
            requiredPermissions: ['admin', 'project-manager']
        },
        {
            path: '/safety-management',
            component: pages.SafetyManagement,
            requiredPermissions: ['admin', 'safety-officer']
        },
        {
            path: '/scheduling',
            component: pages.SchedulingSystem,
            requiredPermissions: ['admin', 'operations']
        },
        {
            path: '/settings',
            component: pages.Settings,
            requiredPermissions: ['admin']
        },
        {
            path: '/team-management',
            component: pages.TeamManagement,
            requiredPermissions: ['admin', 'hr']
        },
        {
            path: '/tracking',
            component: pages.Tracking,
            requiredPermissions: ['admin', 'operations']
        },
        {
            path: '/veteran-resources',
            component: pages.VeteranResources,
            requiredPermissions: ['public']
        },
        {
            path: '*',
            component: pages.NotFound,
            requiredPermissions: ['public']
        }
    ];

    return (
        <Router>
            <AnimatePresence>
                <Switch>
                    {pageRoutes.map((route, index) => (
                        <EnhancedRoute 
                            key={route.path || index} 
                            {...route} 
                        />
                    ))}
                </Switch>
            </AnimatePresence>
        </Router>
    );
};

export default PageManager;