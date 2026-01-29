import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { prisma } from "./prisma";

// 1. CREATE (POST)
app.http('createUser', {
    methods: ['POST'],
    route: 'users',
    authLevel: 'anonymous',
    handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
        try {
            const body: any = await request.json();
            
            if (!body.email || !body.name) {
                return { status: 400, body: "Email y Name son requeridos." };
            }

            const newUser = await prisma.user.create({
                data: {
                    email: body.email,
                    name: body.name,
                    avatarUrl: body.avatarUrl || null
                }
            });

            return { status: 201, jsonBody: newUser };
        } catch (error: any) {
            context.error(`Error creando usuario: ${error.message}`);
            if (error.code === 'P2002') {
                return { status: 409, body: "El email ya existe." };
            }
            return { status: 500, body: "Error interno del servidor." };
        }
    }
});

// 2. READ ALL (GET)
app.http('getUsers', {
    methods: ['GET'],
    route: 'users',
    authLevel: 'anonymous',
    handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
        try {
            const users = await prisma.user.findMany();
            return { status: 200, jsonBody: users };
        } catch (error: any) {
            context.error(error);
            return { status: 500, body: "Error obteniendo usuarios." };
        }
    }
});

// 3. READ ONE (GET)
app.http('getUserById', {
    methods: ['GET'],
    route: 'users/{id}',
    authLevel: 'anonymous',
    handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
        const id = request.params.id;
        if (!id) {
            return { status: 400, body: "ID de usuario requerido." };
        }
        try {
            const user = await prisma.user.findUnique({
                where: { id }
            });

            if (!user) return { status: 404, body: "Usuario no encontrado." };

            return { status: 200, jsonBody: user };
        } catch (error: any) {
            return { status: 500, body: "Error interno." };
        }
    }
});

// 4. UPDATE (PUT)
app.http('updateUser', {
    methods: ['PUT'],
    route: 'users/{id}',
    authLevel: 'anonymous',
    handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
        const id = request.params.id;
        if (!id) {
            return { status: 400, body: "ID de usuario requerido." };
        }
        try {
            const body: any = await request.json();
            
            const updatedUser = await prisma.user.update({
                where: { id },
                data: {
                    email: body.email,
                    name: body.name,
                    avatarUrl: body.avatarUrl
                }
            });

            return { status: 200, jsonBody: updatedUser };
        } catch (error: any) {
            if (error.code === 'P2025') return { status: 404, body: "Usuario no encontrado para actualizar." };
            return { status: 500, body: "Error actualizando usuario." };
        }
    }
});

// 5. DELETE (DELETE)
app.http('deleteUser', {
    methods: ['DELETE'],
    route: 'users/{id}',
    authLevel: 'anonymous',
    handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
        const id = request.params.id;
        if (!id) {
            return { status: 400, body: "ID de usuario requerido." };
        }
        try {
            await prisma.user.delete({
                where: { id }
            });

            return { status: 204 };
        } catch (error: any) {
            if (error.code === 'P2025') return { status: 404, body: "Usuario no encontrado para eliminar." };
            return { status: 500, body: "Error eliminando usuario." };
        }
    }
});