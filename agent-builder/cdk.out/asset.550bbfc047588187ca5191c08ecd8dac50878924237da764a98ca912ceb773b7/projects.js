import { DatabaseService } from "../utils/database";
import { createSuccessResponse, createErrorResponse, getUserIdFromEvent, validateRequired, parseJSON, } from "../utils/lambda";
const db = new DatabaseService();
export const handler = async (event) => {
    console.log("Projects handler event:", JSON.stringify(event, null, 2));
    try {
        const method = event.httpMethod;
        const pathParameters = event.pathParameters || {};
        switch (method) {
            case "GET":
                if (pathParameters.id) {
                    return await getProject(pathParameters.id);
                }
                else {
                    return await getProjects(event);
                }
            case "POST":
                return await createProject(event);
            case "PATCH":
                if (!pathParameters.id) {
                    return createErrorResponse(400, "Project ID is required");
                }
                return await updateProject(pathParameters.id, event);
            case "DELETE":
                if (!pathParameters.id) {
                    return createErrorResponse(400, "Project ID is required");
                }
                return await deleteProject(pathParameters.id);
            default:
                return createErrorResponse(405, "Method not allowed");
        }
    }
    catch (error) {
        console.error("Error in projects handler:", error);
        return createErrorResponse(500, "Internal server error", error);
    }
};
const getProjects = async (event) => {
    try {
        const userId = getUserIdFromEvent(event);
        const projects = await db.getUserProjects(userId);
        return createSuccessResponse({ projects });
    }
    catch (error) {
        console.error("Error getting projects:", error);
        return createErrorResponse(500, "Failed to get projects", error);
    }
};
const getProject = async (projectId) => {
    try {
        const project = await db.getProject(projectId);
        if (!project) {
            return createErrorResponse(404, "Project not found");
        }
        return createSuccessResponse({ project });
    }
    catch (error) {
        console.error("Error getting project:", error);
        return createErrorResponse(500, "Failed to get project", error);
    }
};
const createProject = async (event) => {
    try {
        const userId = getUserIdFromEvent(event);
        const body = parseJSON(event.body || "{}");
        validateRequired(body, ["projectName", "requestPrompt"]);
        const project = await db.createProject(userId, body.projectName, body.requestPrompt);
        // Create initial tasks for the project
        const initialTasks = [
            {
                projectId: project.projectId,
                assignedAgent: "ProductManagerAgent",
                status: "TODO",
                dependencies: [],
                description: "Analyze requirements and create SRS document",
            },
            {
                projectId: project.projectId,
                assignedAgent: "BackendEngineerAgent",
                status: "TODO",
                dependencies: [],
                description: "Design database schema and create backend APIs",
            },
            {
                projectId: project.projectId,
                assignedAgent: "FrontendEngineerAgent",
                status: "TODO",
                dependencies: [],
                description: "Create React components and user interface",
            },
            {
                projectId: project.projectId,
                assignedAgent: "DevOpsEngineerAgent",
                status: "TODO",
                dependencies: [],
                description: "Deploy application to cloud infrastructure",
            },
        ];
        for (const task of initialTasks) {
            await db.createTask(task);
        }
        return createSuccessResponse({
            projectId: project.projectId,
            status: "created",
            message: "Project created successfully",
        });
    }
    catch (error) {
        console.error("Error creating project:", error);
        return createErrorResponse(500, "Failed to create project", error);
    }
};
const updateProject = async (projectId, event) => {
    try {
        const body = parseJSON(event.body || "{}");
        const project = await db.updateProject(projectId, body);
        return createSuccessResponse({ project });
    }
    catch (error) {
        console.error("Error updating project:", error);
        return createErrorResponse(500, "Failed to update project", error);
    }
};
const deleteProject = async (projectId) => {
    try {
        await db.deleteProject(projectId);
        return createSuccessResponse({ message: "Project deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting project:", error);
        return createErrorResponse(500, "Failed to delete project", error);
    }
};
//# sourceMappingURL=projects.js.map