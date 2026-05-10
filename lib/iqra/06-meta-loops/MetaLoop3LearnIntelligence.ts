/**
 * Meta-Loop 3: Learn Intelligence
 * Integrates with IQRA 7-Layer Architecture for intelligent learning
 * 
 * "وَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ" — الزلزلة: 7
 */

import { IQRASevenLayerArchitecture } from '../01-core/IQRASevenLayerArchitecture';
import { HierarchicalMemorySystem } from '../01-core/HierarchicalMemorySystem';
import { MetaLoop2Result } from './MetaLoop2MemoryIntelligence';
import { EnhancedPatternHunt, MetaLoop1Result } from './MetaLoop1PatternsHunter';

// ── Core Types ────────────────────────────────────────────────────────────────

export interface ExperienceBuffer {
  /** Topological analysis results */
  topological_analysis: {
    stability_scores: number[];
    evolution_patterns: string[];
    learning_curves: number[];
  };
  /** Pattern performance metrics */
  performance_metrics: {
    accuracy_trends: number[];
    efficiency_improvements: number[];
    resource_utilization: number[];
  };
  /** Learning insights */
  learning_insights: Array<{
    insight: string;
    confidence: number;
    evidence: string[];
    timestamp: number;
  }>;
}

export interface LessonExtraction {
  /** Extracted lessons */
  lessons: Array<{
    id: string;
    lesson: string;
    category: 'topological' | 'quantum' | 'memory' | 'pattern' | 'system';
    confidence: number;
    applicability: number[];
    success_rate: number;
  }>;
  /** Skill bank updates */
  skill_bank_updates: Array<{
    skill_id: string;
    improvement: number;
    new_capabilities: string[];
    mastery_level: number;
  }>;
  /** Failed skill evolution */
  failed_skill_evolution: Array<{
    skill_id: string;
    failure_reason: string;
    adaptation_strategy: string;
    retry_count: number;
  }>;
}

export interface SkillBank {
  /** Current skills */
  skills: Map<string, {
    name: string;
    category: string;
    mastery_level: number;
    success_rate: number;
    last_improved: number;
    capabilities: string[];
  }>;
  /** Learning statistics */
  learning_stats: {
    total_skills: number;
    average_mastery: number;
    learning_velocity: number;
    skill_distribution: Record<string, number>;
  };
}

export interface CrossDomainTransfer {
  /** Transfer learning results */
  transfer_results: Array<{
    source_domain: string;
    target_domain: string;
    transfer_efficiency: number;
    adaptation_time: number;
    success_rate: number;
  }>;
  /** Domain relationships */
  domain_relationships: Array<{
    domain1: string;
    domain2: string;
    relationship_strength: number;
    transfer_patterns: string[];
  }>;
}

export interface MetaLoop3Result {
  /** Experience buffer analysis */
  experience_buffer: ExperienceBuffer;
  /** Lesson extraction results */
  lesson_extraction: LessonExtraction;
  /** Skill bank updates */
  skill_bank_updates: SkillBank;
  /** Cross-domain transfer results */
  cross_domain_transfer: CrossDomainTransfer;
  /** Integration metrics */
  integration_metrics: {
    learning_efficiency: number;
    knowledge_retention: number;
    adaptation_speed: number;
    system_intelligence: number;
  };
}

// ── MetaLoop3LearnIntelligence Class ─────────────────────────────────────

export class MetaLoop3LearnIntelligence {
  private iqraArchitecture: IQRASevenLayerArchitecture;
  private memorySystem: HierarchicalMemorySystem;

  constructor() {
    this.iqraArchitecture = new IQRASevenLayerArchitecture();
    this.memorySystem = new HierarchicalMemorySystem();
  }

  /**
   * Main learning intelligence pipeline
   */
  async learnIntelligence(
    text: string,
    metadata: { surah: number; ayah: number },
    previousResults: {
      metaLoop1: MetaLoop1Result;
      metaLoop2: MetaLoop2Result;
    }
  ): Promise<MetaLoop3Result> {
    console.log('🧠 Starting learning intelligence with Meta-Loop 3...');
    
    // 8.1: Build ExperienceBuffer with topological analysis
    const experienceBuffer = await this.buildExperienceBuffer(
      text,
      metadata,
      previousResults
    );
    
    // 8.2: Apply lesson extraction with quantum insight
    const lessonExtraction = await this.extractLessonsWithQuantumInsight(
      experienceBuffer,
      previousResults
    );
    
    // 8.3: Update SkillBank with zigzag evolution tracking
    const skillBankUpdates = await this.updateSkillBankWithZigzagEvolution(
      lessonExtraction,
      previousResults
    );
    
    // 8.4: Build failed skill evolution with adaptive learning
    const failedSkillEvolution = await this.buildFailedSkillEvolution(
      skillBankUpdates,
      previousResults
    );
    
    // 8.5: Add cross-domain pattern transfer learning
    const crossDomainTransfer = await this.addCrossDomainTransferLearning(
      skillBankUpdates,
      previousResults
    );
    
    // Calculate integration metrics
    const integrationMetrics = await this.calculateIntegrationMetrics(
      experienceBuffer,
      lessonExtraction,
      skillBankUpdates,
      crossDomainTransfer
    );

    console.log('✅ Learning intelligence completed');
    
    return {
      experience_buffer: experienceBuffer,
      lesson_extraction: lessonExtraction,
      skill_bank_updates: skillBankUpdates,
      failed_skill_evolution: failedSkillEvolution,
      cross_domain_transfer: crossDomainTransfer,
      integration_metrics: integrationMetrics
    };
  }

  /**
   * 8.1: Build ExperienceBuffer with topological analysis
   */
  private async buildExperienceBuffer(
    text: string,
    metadata: { surah: number; ayah: number },
    previousResults: { metaLoop1: MetaLoop1Result; metaLoop2: MetaLoop2Result }
  ): Promise<ExperienceBuffer> {
    console.log('📊 Building ExperienceBuffer with topological analysis...');
    
    // Analyze stability scores from previous results
    const stabilityScores = [
      previousResults.metaLoop1.integration_metrics.accuracy_improvement,
      previousResults.metaLoop2.integration_metrics.memory_intelligence_score
    ];
    
    // Extract evolution patterns
    const evolutionPatterns = this.extractEvolutionPatterns(previousResults);
    
    // Calculate learning curves
    const learningCurves = this.calculateLearningCurves(previousResults);
    
    // Analyze performance metrics
    const performanceMetrics = {
      accuracy_trends: this.calculateAccuracyTrends(previousResults),
      efficiency_improvements: this.calculateEfficiencyImprovements(previousResults),
      resource_utilization: this.calculateResourceUtilization(previousResults)
    };
    
    // Generate learning insights
    const learningInsights = await this.generateLearningInsights(
      stabilityScores,
      evolutionPatterns,
      performanceMetrics
    );

    return {
      topological_analysis: {
        stability_scores: stabilityScores,
        evolution_patterns: evolutionPatterns,
        learning_curves: learningCurves
      },
      performance_metrics: performanceMetrics,
      learning_insights: learningInsights
    };
  }

  /**
   * 8.2: Apply lesson extraction with quantum insight
   */
  private async extractLessonsWithQuantumInsight(
    experienceBuffer: ExperienceBuffer,
    previousResults: { metaLoop1: MetaLoop1Result; metaLoop2: MetaLoop2Result }
  ): Promise<LessonExtraction> {
    console.log('🧠 Extracting lessons with quantum insight...');
    
    // Use IQRA quantum model for enhanced analysis
    await this.iqraArchitecture.ensureModelLoaded('topology');
    
    // Extract lessons from experience buffer
    const lessons = await this.extractLessonsFromExperience(experienceBuffer);
    
    // Update skill bank
    const skillBankUpdates = await this.updateSkillBankFromLessons(lessons);
    
    // Build failed skill evolution
    const failedSkillEvolution = await this.buildFailedSkillEvolutionFromLessons(lessons);

    return {
      lessons,
      skill_bank_updates: skillBankUpdates,
      failed_skill_evolution: failedSkillEvolution
    };
  }

  /**
   * 8.3: Update SkillBank with zigzag evolution tracking
   */
  private async updateSkillBankWithZigzagEvolution(
    lessonExtraction: LessonExtraction,
    previousResults: { metaLoop1: MetaLoop1Result; metaLoop2: MetaLoop2Result }
  ): Promise<SkillBank> {
    console.log('🔄 Updating SkillBank with zigzag evolution tracking...');
    
    // Initialize skills map
    const skills = new Map();
    
    // Process lesson extractions
    for (const lesson of lessonExtraction.lessons) {
      const skillId = `skill_${lesson.category}_${lesson.id}`;
      
      // Calculate mastery level based on confidence and success rate
      const masteryLevel = lesson.confidence * lesson.success_rate;
      
      // Determine capabilities from lesson
      const capabilities = this.extractCapabilitiesFromLesson(lesson);
      
      skills.set(skillId, {
        name: lesson.lesson,
        category: lesson.category,
        mastery_level: masteryLevel,
        success_rate: lesson.success_rate,
        last_improved: Date.now(),
        capabilities: capabilities
      });
    }
    
    // Calculate learning statistics
    const learningStats = this.calculateLearningStatistics(skills);
    
    return {
      skills,
      learning_stats: learningStats
    };
  }

  /**
   * 8.4: Build failed skill evolution with adaptive learning
   */
  private async buildFailedSkillEvolution(
    skillBankUpdates: SkillBank,
    previousResults: { metaLoop1: MetaLoop1Result; metaLoop2: MetaLoop2Result }
  ): Promise<Array<{
    skill_id: string;
    failure_reason: string;
    adaptation_strategy: string;
    retry_count: number;
  } {
    console.log('🔧 Building failed skill evolution with adaptive learning...');
    
    const failedSkillEvolution = [];
    
    // Analyze failed skills from previous results
    for (const [skillId, skill] of skillBankUpdates.skills) {
      if (skill.success_rate < 0.7) { // Consider as failed
        const failureReason = this.analyzeFailureReason(skill);
        const adaptationStrategy = this.generateAdaptationStrategy(failureReason);
        const retryCount = this.calculateRetryCount(skillId, previousResults);
        
        failedSkillEvolution.push({
          skill_id: skillId,
          failure_reason: failureReason,
          adaptation_strategy: adaptationStrategy,
          retry_count: retryCount
        });
      }
    }
    
    return failedSkillEvolution;
  }

  /**
   * 8.5: Add cross-domain pattern transfer learning
   */
  private async addCrossDomainTransferLearning(
    skillBankUpdates: SkillBank,
    previousResults: { metaLoop1: MetaLoop1Result; metaLoop2: MetaLoop2Result }
  ): Promise<CrossDomainTransfer> {
    console.log('🔄 Adding cross-domain pattern transfer learning...');
    
    // Identify domains from skills
    const domains = this.identifyDomains(skillBankUpdates);
    
    // Calculate transfer results
    const transferResults = [];
    for (let i = 0; i < domains.length; i++) {
      for (let j = i + 1; j < domains.length; j++) {
        const transferResult = await this.calculateTransferEfficiency(
          domains[i],
          domains[j],
          skillBankUpdates
        );
        transferResults.push(transferResult);
      }
    }
    
    // Calculate domain relationships
    const domainRelationships = this.calculateDomainRelationships(domains, transferResults);
    
    return {
      transfer_results: transferResults,
      domain_relationships: domainRelationships
    };
  }

  // Helper methods
  private extractEvolutionPatterns(previousResults: any): string[] {
    const patterns = [];
    
    // Analyze patterns from meta-loop results
    if (previousResults.metaLoop1 && previousResults.metaLoop2) {
      const accuracyImprovement = previousResults.metaLoop1.integration_metrics.accuracy_improvement;
      const memoryIntelligence = previousResults.metaLoop2.integration_metrics.memory_intelligence_score;
      
      if (accuracyImprovement > 0.8 && memoryIntelligence > 0.8) {
        patterns.push('High accuracy and memory intelligence indicate successful learning');
      }
      
      if (accuracyImprovement > 0.6 && memoryIntelligence > 0.6) {
        patterns.push('Moderate improvement suggests partial learning');
      }
    }
    
    return patterns;
  }

  private calculateLearningCurves(previousResults: any): number[] {
    const curves = [];
    
    // Calculate learning curves from integration metrics
    if (previousResults.metaLoop1) {
      curves.push(previousResults.metaLoop1.integration_metrics.accuracy_improvement);
    }
    
    if (previousResults.metaLoop2) {
      curves.push(previousResults.metaLoop2.integration_metrics.memory_intelligence_score);
    }
    
    return curves;
  }

  private calculateAccuracyTrends(previousResults: any): number[] {
    const trends = [];
    
    if (previousResults.metaLoop1) {
      trends.push(previousResults.metaLoop1.integration_metrics.accuracy_improvement);
    }
    
    return trends;
  }

  private calculateEfficiencyImprovements(previousResults: any): number[] {
    const improvements = [];
    
    if (previousResults.metaLoop2) {
      improvements.push(previousResults.metaLoop2.integration_metrics.memory_intelligence_score);
    }
    
    return improvements;
  }

  private calculateResourceUtilization(previousResults: any): number[] {
    const utilization = [];
    
    // Calculate resource utilization from integration metrics
    if (previousResults.metaLoop1 && previousResults.metaLoop2) {
      const avgUtilization = (
        previousResults.metaLoop1.integration_metrics.processing_speed +
        previousResults.metaLoop2.integration_metrics.system_performance
      ) / 2;
      utilization.push(avgUtilization);
    }
    
    return utilization;
  }

  private async generateLearningInsights(
    stabilityScores: number[],
    evolutionPatterns: string[],
    performanceMetrics: any
  ): Promise<ExperienceBuffer['learning_insights']> {
    const insights = [];
    
    // Generate insights from stability scores
    const avgStability = stabilityScores.reduce((sum, score) => sum + score, 0) / stabilityScores.length;
    if (avgStability > 0.8) {
      insights.push({
        insight: 'High stability indicates successful learning patterns',
        confidence: avgStability,
        evidence: ['avgStability > 0.8'],
        timestamp: Date.now()
      });
    }
    
    // Generate insights from evolution patterns
    for (const pattern of evolutionPatterns) {
      insights.push({
        insight: pattern,
        confidence: 0.8,
        evidence: ['evolution_pattern'],
        timestamp: Date.now()
      });
    }
    
    return insights;
  }

  private async extractLessonsFromExperience(experienceBuffer: ExperienceBuffer): Promise<LessonExtraction['lessons']> {
    const lessons = [];
    
    // Extract lessons from learning insights
    for (const insight of experienceBuffer.learning_insights) {
      const category = this.categorizeInsight(insight.insight);
      
      lessons.push({
        id: `lesson_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        lesson: insight.insight,
        category,
        confidence: insight.confidence,
        applicability: ['pattern_recognition', 'memory_management', 'topological_analysis'],
        success_rate: insight.confidence
      });
    }
    
    return lessons;
  }

  private categorizeInsight(insight: string): LessonExtraction['lessons'][0]['category'] {
    if (insight.includes('stability') || insight.includes('learning')) {
      return 'system';
    } else if (insight.includes('topological') || insight.includes('pattern')) {
      return 'pattern';
    } else if (insight.includes('memory') || insight.includes('cache')) {
      return 'memory';
    } else if (insight.includes('quantum') || insight.includes('coherence')) {
      return 'quantum';
    } else {
      return 'topological';
    }
  }

  private async updateSkillBankFromLessons(lessons: LessonExtraction['lessons']): Promise<LessonExtraction['skill_bank_updates']> {
    const updates = [];
    
    for (const lesson of lessons) {
      const skillId = `skill_${lesson.category}_${lesson.id}`;
      
      updates.push({
        skill_id: skillId,
        improvement: lesson.confidence * 0.1,
        new_capabilities: [lesson.lesson],
        mastery_level: lesson.success_rate
      });
    }
    
    return updates;
  }

  private async buildFailedSkillEvolutionFromLessons(lessons: LessonExtraction['lessons']): Promise<LessonExtraction['failed_skill_evolution']> {
    const failedEvolution = [];
    
    for (const lesson of lessons) {
      if (lesson.success_rate < 0.7) {
        failedEvolution.push({
          skill_id: `skill_${lesson.category}_${lesson.id}`,
          failure_reason: `Low success rate: ${lesson.success_rate}`,
          adaptation_strategy: 'Increase training data and adjust parameters',
          retry_count: 1
        });
      }
    }
    
    return failedEvolution;
  }

  private extractCapabilitiesFromLesson(lesson: LessonExtraction['lessons'][0]): string[] {
    return lesson.applicability;
  }

  private calculateLearningStatistics(skills: Map<string, any>): SkillBank['learning_stats'] {
    const totalSkills = skills.size;
    let totalMastery = 0;
    const skillDistribution: Record<string, number> = {};
    
    for (const [skillId, skill] of skills) {
      totalMastery += skill.mastery_level;
      skillDistribution[skill.category] = (skillDistribution[skill.category] || 0) + 1;
    }
    
    const averageMastery = totalSkills > 0 ? totalMastery / totalSkills : 0;
    const learningVelocity = averageMastery * 0.1; // Mock calculation
    
    return {
      total_skills: totalSkills,
      average_mastery: averageMastery,
      learning_velocity: learningVelocity,
      skill_distribution: skillDistribution
    };
  }

  private analyzeFailureReason(skill: any): string {
    if (skill.success_rate < 0.5) {
      return 'Very low success rate indicates fundamental misunderstanding';
    } else if (skill.success_rate < 0.7) {
      return 'Low success rate suggests need for more practice or better examples';
    } else {
      return 'Moderate success rate indicates partial understanding';
    }
  }

  private generateAdaptationStrategy(failureReason: string): string {
    if (failureReason.includes('fundamental')) {
      return 'Return to basics and rebuild understanding from foundation';
    } else if (failureReason.includes('misunderstanding')) {
      return 'Provide more examples and alternative explanations';
    } else {
      return 'Increase practice and refine approach gradually';
    }
  }

  private calculateRetryCount(skillId: string, previousResults: any): number {
    // Mock calculation - in practice would track actual retries
    return Math.floor(Math.random() * 3) + 1;
  }

  private identifyDomains(skillBank: SkillBank): string[] {
    const domains = new Set();
    
    for (const [skillId, skill] of skillBank.skills) {
      domains.add(skill.category);
    }
    
    return Array.from(domains);
  }

  private async calculateTransferEfficiency(
    domain1: string,
    domain2: string,
    skillBank: SkillBank
  ): Promise<CrossDomainTransfer['transfer_results'][0]> {
    // Mock calculation - in practice would use actual transfer learning
    const domain1Skills = Array.from(skillBank.skills.values()).filter(s => s.category === domain1);
    const domain2Skills = Array.from(skillBank.skills.values()).filter(s => s.category === domain2);
    
    const avgMastery1 = domain1Skills.reduce((sum, s) => sum + s.mastery_level, 0) / Math.max(domain1Skills.length, 1);
    const avgMastery2 = domain2Skills.reduce((sum, s) => sum + s.mastery_level, 0) / Math.max(domain2Skills.length, 1);
    
    const transferEfficiency = Math.min(avgMastery1, avgMastery2) / Math.max(avgMastery1, avgMastery2);
    const adaptationTime = 1000 / (transferEfficiency + 0.1); // Mock time in ms
    const successRate = transferEfficiency * 0.9; // Mock success rate
    
    return {
      source_domain: domain1,
      target_domain: domain2,
      transfer_efficiency: transferEfficiency,
      adaptation_time: adaptationTime,
      success_rate: successRate
    };
  }

  private calculateDomainRelationships(
    domains: string[],
    transferResults: CrossDomainTransfer['transfer_results']
  ): CrossDomainTransfer['domain_relationships'] {
    const relationships = [];
    
    for (let i = 0; i < transferResults.length; i++) {
      const result = transferResults[i];
      const relationshipStrength = result.transfer_efficiency;
      
      relationships.push({
        domain1: result.source_domain,
        domain2: result.target_domain,
        relationship_strength: relationshipStrength,
        transfer_patterns: [`Pattern transfer from ${result.source_domain} to ${result.target_domain}`]
      });
    }
    
    return relationships;
  }

  private async calculateIntegrationMetrics(
    experienceBuffer: ExperienceBuffer,
    lessonExtraction: LessonExtraction,
    skillBankUpdates: SkillBank,
    crossDomainTransfer: CrossDomainTransfer
  ): Promise<MetaLoop3Result['integration_metrics']> {
    // Calculate learning efficiency
    const learningEfficiency = (
      experienceBuffer.learning_insights.length +
      lessonExtraction.lessons.length +
      skillBankUpdates.learning_stats.total_skills
    ) / 3;
    
    // Calculate knowledge retention
    const avgMastery = skillBankUpdates.learning_stats.average_mastery;
    const knowledgeRetention = avgMastery * 0.9; // Mock retention rate
    
    // Calculate adaptation speed
    const avgAdaptationTime = crossDomainTransfer.transfer_results.reduce(
      (sum, result) => sum + result.adaptation_time,
      0
    ) / Math.max(crossDomainTransfer.transfer_results.length, 1);
    const adaptationSpeed = 1000 / (avgAdaptationTime + 1);
    
    // Calculate system intelligence
    const systemIntelligence = (
      learningEfficiency +
      knowledgeRetention +
      adaptationSpeed
    ) / 3;
    
    return {
      learning_efficiency: learningEfficiency,
      knowledge_retention: knowledgeRetention,
      adaptation_speed: adaptationSpeed,
      system_intelligence: systemIntelligence
    };
  }
}