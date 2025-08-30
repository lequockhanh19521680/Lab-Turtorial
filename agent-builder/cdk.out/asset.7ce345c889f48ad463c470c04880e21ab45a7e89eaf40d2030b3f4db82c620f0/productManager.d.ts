import { Context } from 'aws-lambda';
import { AgentExecutionContext, AgentResponse } from '../models';
/**
 * Extract key features from requirements
 */
export declare const extractFeatures: (requirements: any) => string[];
/**
 * Generate user stories from requirements
 */
export declare const generateUserStories: (requirements: any) => string[];
/**
 * Validate requirements object structure
 */
export declare const validateRequirements: (requirements: any) => boolean;
/**
 * Calculate project complexity based on requirements
 */
export declare const calculateComplexity: (requirements: any) => "Low" | "Medium" | "High";
/**
 * Estimate development time based on complexity and requirements
 */
export declare const estimateDevelopmentTime: (requirements: any) => string;
export declare const handler: (event: AgentExecutionContext, _context: Context) => Promise<AgentResponse>;
//# sourceMappingURL=productManager.d.ts.map