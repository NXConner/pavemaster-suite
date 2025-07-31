import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  KnowledgeDocument,
  AIAssistantQuery, 
  AIAssistantResponse,
  Notification,
  AILearning,
  KnowledgeDocumentSchema,
  AIAssistantQuerySchema,
  AIAssistantResponseSchema,
  NotificationSchema,
  AILearningSchema
} from '../schemas/ai-assistant-schema';

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// AI Assistant Hook
export function useAIAssistant() {
  const [knowledgeDocuments, setKnowledgeDocuments] = useState<KnowledgeDocument[]>([]);
  const [queries, setQueries] = useState<AIAssistantQuery[]>([]);
  const [responses, setResponses] = useState<AIAssistantResponse[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Upload Knowledge Document
  const uploadKnowledgeDocument = useCallback(async (
    file: File,
    metadata: Partial<KnowledgeDocument>
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      const filePath = `knowledge-base/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Extract text content (simplified - in production, use proper text extraction)
      const extractedText = await extractTextFromFile(file);

      // Generate embeddings (simplified - in production, use proper embedding service)
      const embeddings = await generateEmbeddings(extractedText);

      // Create knowledge document
      const knowledgeDocument: KnowledgeDocument = {
        title: metadata.title || file.name,
        document_type: metadata.document_type || 'company_policy',
        content: extractedText,
        tags: metadata.tags || [],
        category: metadata.category || 'paving',
        source: metadata.source,
        version: metadata.version,
        effective_date: metadata.effective_date,
        uploaded_by: metadata.uploaded_by || 'current_user',
        file_url: uploadData.path,
        extracted_text: extractedText,
        embeddings,
        access_level: metadata.access_level || 'internal'
      };

      // Validate document
      const validatedDocument = KnowledgeDocumentSchema.parse(knowledgeDocument);

      // Save to database
      const { data, error } = await supabase
        .from('knowledge_documents')
        .insert(validatedDocument)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setKnowledgeDocuments(prev => [...prev, data]);

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Document upload failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Query AI Assistant
  const queryAssistant = useCallback(async (
    query: string,
    queryType: AIAssistantQuery['query_type'],
    context?: AIAssistantQuery['context']
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const startTime = Date.now();

      // Create query record
      const assistantQuery: AIAssistantQuery = {
        user_id: 'current_user', // Replace with actual user ID
        query,
        query_type: queryType,
        context,
        session_id: `session_${Date.now()}`
      };

      const validatedQuery = AIAssistantQuerySchema.parse(assistantQuery);

      // Save query to database
      const { data: queryData, error: queryError } = await supabase
        .from('ai_assistant_queries')
        .insert(validatedQuery)
        .select()
        .single();

      if (queryError) throw queryError;

      // Search knowledge base for relevant documents
      const relevantDocuments = await searchKnowledgeBase(query, queryType);

      // Generate AI response based on context and knowledge base
      const aiResponse = await generateAIResponse(query, queryType, relevantDocuments, context);

      // Check for regulatory alerts
      const regulatoryAlerts = await checkRegulatoryAlerts(query, context);

      // Generate cost estimates if relevant
      const costEstimates = await generateCostEstimates(query, queryType, context);

      // Create response
      const assistantResponse: AIAssistantResponse = {
        query_id: queryData.id!,
        response: aiResponse.response,
        confidence_score: aiResponse.confidence,
        sources: relevantDocuments.map(doc => ({
          document_id: doc.id!,
          document_title: doc.title,
          relevance_score: doc.relevance_score || 0,
          excerpt: doc.excerpt
        })),
        recommendations: aiResponse.recommendations,
        follow_up_suggestions: aiResponse.followUpSuggestions,
        related_topics: aiResponse.relatedTopics,
        regulatory_alerts: regulatoryAlerts,
        cost_estimates: costEstimates,
        processing_time_ms: Date.now() - startTime
      };

      const validatedResponse = AIAssistantResponseSchema.parse(assistantResponse);

      // Save response to database
      const { data: responseData, error: responseError } = await supabase
        .from('ai_assistant_responses')
        .insert(validatedResponse)
        .select()
        .single();

      if (responseError) throw responseError;

      // Update local state
      setQueries(prev => [...prev, queryData]);
      setResponses(prev => [...prev, responseData]);

      return responseData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'AI query failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get Industry Recommendations
  const getIndustryRecommendations = useCallback(async (
    category: string = 'general'
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // Generate contextual recommendations based on current projects and industry trends
      const recommendations = await generateIndustryRecommendations(category);

      // Create notifications for important recommendations
      for (const recommendation of recommendations.filter(r => r.priority === 'high')) {
        const notification: Notification = {
          user_id: 'current_user',
          type: 'best_practice_tip',
          title: recommendation.title,
          message: recommendation.message,
          priority: recommendation.priority as any,
          category: recommendation.category,
          data: recommendation.data
        };

        const validatedNotification = NotificationSchema.parse(notification);

        await supabase
          .from('notifications')
          .insert(validatedNotification);
      }

      return recommendations;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get recommendations';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Submit Learning Feedback
  const submitFeedback = useCallback(async (
    queryId: string,
    feedback: AILearning['user_feedback'],
    rating?: number,
    feedbackText?: string
  ) => {
    try {
      const learningData: AILearning = {
        query_id: queryId,
        user_feedback: feedback,
        rating,
        feedback_text: feedbackText
      };

      const validatedLearning = AILearningSchema.parse(learningData);

      const { error } = await supabase
        .from('ai_learning')
        .insert(validatedLearning);

      if (error) throw error;
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    }
  }, []);

  // Load user notifications
  const loadNotifications = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', 'current_user')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications(data || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  }, []);

  // Mark notification as read
  const markNotificationRead = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, updated_at: new Date() })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  return {
    knowledgeDocuments,
    queries,
    responses,
    notifications,
    isLoading,
    error,
    uploadKnowledgeDocument,
    queryAssistant,
    getIndustryRecommendations,
    submitFeedback,
    loadNotifications,
    markNotificationRead
  };
}

// Utility Functions

async function extractTextFromFile(file: File): Promise<string> {
  // Simplified text extraction - in production, use proper libraries
  if (file.type.includes('text')) {
    return await file.text();
  }
  
  // For PDFs, Word docs, etc., you'd use specialized libraries
  // like pdf-parse, mammoth, etc.
  return `[Content extracted from ${file.name}]`;
}

async function generateEmbeddings(text: string): Promise<number[]> {
  // Simplified embedding generation - in production, use OpenAI embeddings
  // or other embedding services
  const mockEmbedding = new Array(1536).fill(0).map(() => Math.random());
  return mockEmbedding;
}

async function searchKnowledgeBase(
  query: string, 
  queryType: string
): Promise<Array<KnowledgeDocument & { relevance_score?: number; excerpt?: string }>> {
  try {
    // In production, implement semantic search using embeddings
    const { data, error } = await supabase
      .from('knowledge_documents')
      .select('*')
      .eq('is_active', true)
      .ilike('content', `%${query}%`)
      .limit(5);

    if (error) throw error;

    return (data || []).map(doc => ({
      ...doc,
      relevance_score: Math.random() * 100,
      excerpt: doc.content.substring(0, 200) + '...'
    }));
  } catch (err) {
    console.error('Knowledge base search failed:', err);
    return [];
  }
}

async function generateAIResponse(
  query: string,
  queryType: string,
  relevantDocuments: any[],
  context?: any
) {
  // Simplified AI response generation - in production, use OpenAI or other LLM
  const industryKnowledge = getIndustrySpecificGuidance(queryType, query);
  
  return {
    response: `Based on industry standards and best practices for ${queryType}, here's my guidance: ${industryKnowledge.guidance}`,
    confidence: industryKnowledge.confidence,
    recommendations: industryKnowledge.recommendations,
    followUpSuggestions: industryKnowledge.followUpSuggestions,
    relatedTopics: industryKnowledge.relatedTopics
  };
}

function getIndustrySpecificGuidance(queryType: string, query: string) {
  const guidanceMap = {
    estimation: {
      guidance: "For accurate paving estimates, consider material costs, labor rates, equipment usage, and local regulations. Factor in weather delays and quality requirements.",
      confidence: 85,
      recommendations: [
        "Use current material pricing",
        "Include 10-15% contingency for weather delays",
        "Verify local permit requirements"
      ],
      followUpSuggestions: [
        "Would you like specific material calculations?",
        "Need help with labor cost estimation?",
        "Want to review local regulations?"
      ],
      relatedTopics: ["Material Selection", "Labor Optimization", "Permit Requirements"]
    },
    regulation_lookup: {
      guidance: "Paving regulations vary by state and locality. Key areas include environmental compliance, safety standards, and quality specifications.",
      confidence: 90,
      recommendations: [
        "Check current EPA regulations",
        "Verify OSHA safety requirements",
        "Review local environmental permits"
      ],
      followUpSuggestions: [
        "Need specific state regulations?",
        "Want OSHA compliance checklist?",
        "Need environmental permit guidance?"
      ],
      relatedTopics: ["EPA Compliance", "OSHA Standards", "Local Permits"]
    },
    safety_guidance: {
      guidance: "Safety in paving operations requires proper PPE, equipment maintenance, traffic control, and hazard awareness.",
      confidence: 95,
      recommendations: [
        "Ensure all workers have proper PPE",
        "Implement traffic control procedures",
        "Regular equipment safety inspections"
      ],
      followUpSuggestions: [
        "Need a safety checklist?",
        "Want traffic control guidance?",
        "Need PPE requirements list?"
      ],
      relatedTopics: ["Traffic Control", "PPE Requirements", "Equipment Safety"]
    }
  };

  return guidanceMap[queryType as keyof typeof guidanceMap] || {
    guidance: "I can help with paving, sealcoating, and line striping questions. Please provide more specific details.",
    confidence: 70,
    recommendations: ["Provide more context", "Specify the type of work", "Include project details"],
    followUpSuggestions: ["What specific aspect interests you?", "Need help with a current project?"],
    relatedTopics: ["General Guidance", "Industry Standards"]
  };
}

async function checkRegulatoryAlerts(query: string, context?: any) {
  // Check for relevant regulatory updates or alerts
  return [
    {
      regulation_type: "EPA Environmental",
      description: "New stormwater management requirements effective Q2 2024",
      compliance_deadline: new Date('2024-06-01'),
      severity: 'warning' as const
    }
  ];
}

async function generateCostEstimates(query: string, queryType: string, context?: any) {
  if (queryType !== 'estimation') return undefined;

  // Simplified cost estimation - in production, use actual pricing data
  return {
    material_cost: 5000,
    labor_cost: 3000,
    equipment_cost: 2000,
    total_estimate: 10000,
    confidence_level: "Medium - based on regional averages"
  };
}

async function generateIndustryRecommendations(category: string) {
  // Generate contextual recommendations based on industry trends and best practices
  const recommendationsMap = {
    general: [
      {
        title: "Seasonal Preparation Reminder",
        message: "Winter preparation checklist: equipment winterization, material storage, crew scheduling",
        priority: "high",
        category: "operations",
        data: { checklist_url: "/checklists/winter-prep" }
      },
      {
        title: "New EPA Regulations",
        message: "Updated stormwater management requirements - review compliance status",
        priority: "high",
        category: "regulations",
        data: { regulation_id: "EPA-2024-SW" }
      }
    ],
    safety: [
      {
        title: "Traffic Control Best Practices",
        message: "Updated traffic control guidelines for work zones - ensure crew training is current",
        priority: "medium",
        category: "safety",
        data: { training_modules: ["traffic-control-101", "work-zone-safety"] }
      }
    ]
  };

  return recommendationsMap[category as keyof typeof recommendationsMap] || recommendationsMap.general;
}