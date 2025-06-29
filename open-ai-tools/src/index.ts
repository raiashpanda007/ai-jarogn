import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY // Fixed typo
})

const getCurrentTimeAndDate = () => {
    const now = new Date();
    return JSON.stringify({
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString()
    });
}

const callOpenAIWithFunctionCalling = async () => {
    const context: OpenAI.Chat.ChatCompletionMessageParam[] = [
        {
            role: "system",
            content: "Act cool bruh !!!"
        },
        {
            role: "user",
            content: "What's the date and time right now"
        }
    ]

    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: context,
        tools: [{
            type: "function",
            function: {
                name: "getCurrentTimeAndDate",
                description: "Gets time and date"
            }
        }]
    })

    const shouldInvokeFunction = response.choices[0].finish_reason === "tool_calls"
    
    if (shouldInvokeFunction) {
        const toolCall = response.choices[0].message.tool_calls![0];
        const functionName = toolCall.function.name;
        
        if (functionName === "getCurrentTimeAndDate") {
            const functionResponse = getCurrentTimeAndDate();
            context.push(response.choices[0].message); // Add assistant's tool call message
            context.push({
                role: "tool",
                content: functionResponse,
                tool_call_id: toolCall.id
            });
            
            
            const finalResponse = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: context
            });
            
            console.log(finalResponse.choices[0].message.content);
        }
    }
}

callOpenAIWithFunctionCalling().catch(console.error);