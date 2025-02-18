import {streamText , Message } from "ai";
import {createGoogleGenerativeAI} from "@ai-sdk/google";
import { initialMessage } from "@/lib/data";


const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) throw new Error("GOOGLE_API_KEY is missing!");

const google = createGoogleGenerativeAI({
    apikey: apiKey,
});


export const runtime = "edge" ; //to function in edge 

const generateId = () => Math.random().toString(36).slice(2,15);

const buildGoogleGenAIPrompt = (messages : Message[]) : Message[] => [
    {
        id: generateId(),
        role: "user",
        content : initialMessage.content
    },
    ...messages.map((message) => ({
        id : message.id || generateId(),
        role : message.role,
        content : message.content,
    })),
];

export async function POST(request: Request){
    const {messages} = await request.json();
    const stream = await streamText({
        model: google("gemini-1.5-flash"),
        messages : buildGoogleGenAIPrompt(messages),
        temperature : 0.7 ,
    });

    return stream?.toDataStreamResponse();
}