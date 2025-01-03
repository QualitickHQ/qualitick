import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { queue } from "@/lib/queue";
import { prisma } from "@/lib/prisma";

// Define URL schema
const UrlSchema = z.object({
    name: z.string(),
    file_type: z.enum(["image", "video", "website"]),
    type: z.string().optional(),
    src: z.string().url()
});

// Define request body schema
const TrackSchema = z.object({
    input: z.string(),
    output: z.string(),
    event: z.string(),
    conversation_id: z.string().optional(),
    model: z.string(),
    urls: z.array(UrlSchema).optional().default([])
});

export async function POST(request: NextRequest) {
    try {
        // Get API key from Authorization header
        const authHeader = request.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { success: false, message: "Invalid authorization header" },
                { status: 401 }
            );
        }

        const apiKey = authHeader.split(' ')[1];


        // Find project by API key
        const project = await prisma.project.findUnique({
            where: { apiKey },
            include: { organization: true }
        });

        if (!project) {
            return NextResponse.json(
                { success: false, message: "Invalid API key" },
                { status: 401 }
            );
        }

        // Parse and validate request body
        const body = await request.json();
        const validatedData = TrackSchema.parse(body);

        // Add to queue
        await queue.add('track', {
            projectId: project.id,
            organizationId: project.organizationId,
            data: validatedData
        });

        return NextResponse.json({
            success: true,
            message: "Tracking data queued successfully"
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Validation error",
                    errors: error.errors
                },
                { status: 400 }
            );
        }

        console.error('Track API Error:', error);
        return NextResponse.json(
            {
                success: false,
                message: "Internal server error"
            },
            { status: 500 }
        );
    }
}
