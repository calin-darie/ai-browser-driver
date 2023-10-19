import {
  ChatCompletionRequestMessageRoleEnum,
  Configuration,
  CreateChatCompletionResponse,
  CreateCompletionResponseUsage,
  OpenAIApi,
} from 'openai';
import { useAppState } from '../state/store';
import { availableActions } from './availableActions';
import { ParsedResponseSuccess } from './parseResponse';

const formattedActions = availableActions
  .map((action) => {
    const argExamples = action.args.reduce(
      (argsObject, current) => {
        argsObject[current.name] = current.example;

        return argsObject;
      },
      {} as any);
    return `
${action.description}
\`\`\`
` + JSON.stringify({
  thought: action.exampleThought,
  actions: [
    {
      name: action.name,
      args: argExamples
    }
  ]
}) +`
\`\`\``
  })
  .join('\n');

const systemMessage = `
You are an autonomous browser agent driving the browser via code.

I will give you a goal. You will respond with a single valid JSON array actions. When automatically parsed and interpreted by a browser extension, these actions will reach the goal.

The JSON array will contain one to three actions that will be automatically parsed. No explanation  outside the JSON is allowed, otheriwise the parse will fail. All explanations must be expressed as part of a "thought"

The response should contain a single array. Invalid example:
[
]
[
]

Thoughts have to be inspired by the current DOM and also inspired by your previous chain of thought. Each new thought will express partial conclusions.

The only valid actions are setValue, click, finish and fail. Do both sevValue & click in the same response wherever possible.

You will reply with a single JSON array of {"thought": "", "action": ""} objects. You must start from these valid examples:

Example 1
[
{"thought":"Search for \"yellow toy trucks\"","action":{"name":"setValue","args":{"elementId":78,"value":"this is my text"}}},
{"thought":"Submit the address and continue to payment","action":{"name":"click","args":{"elementId":223}}},
]

Example 2. Indicates the task is finished. The thought must be backed up by evidence in the DOM. If you decide to take this action, it must be the only action that you take. This will end the conversation.
[
{"thought":"I have found the requested info. Earth - Sun distance is 149.6 milion km.","action":{"name":"finish","args":{}}}
]`;

export async function determineNextAction(
  taskInstructions: string,
  previousActions: ParsedResponseSuccess[],
  simplifiedDOM: string,
  maxAttempts = 1,
  notifyError?: (error: string) => void
) {
  const model = useAppState.getState().settings.selectedModel;
  const prompt = formatPrompt(simplifiedDOM);
  const key = useAppState.getState().settings.openAIKey;
  if (!key) {
    notifyError?.('No OpenAI key found');
    return null;
  }

  const openai = new OpenAIApi(
    new Configuration({
      apiKey: key,
    })
  );

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const request = {
        model: model,
        messages: previousActions.length > 0? [
          {
            role: ChatCompletionRequestMessageRoleEnum.System,
            content: systemMessage,
          },
          { role: ChatCompletionRequestMessageRoleEnum.User, content: taskInstructions },
          {
            role: ChatCompletionRequestMessageRoleEnum.Assistant,
            content: previousActions.map(response => JSON.stringify(response)).join("\n\n")
          },
          { role: ChatCompletionRequestMessageRoleEnum.User, content: prompt },
        ]: [
          {
            role: ChatCompletionRequestMessageRoleEnum.System,
            content: systemMessage,
          },
          { 
            role: ChatCompletionRequestMessageRoleEnum.User, 
            content: taskInstructions + prompt 
          },
        ],
        max_tokens: 500,
        temperature: 0,
        stop: "]"
      };
      const completion = await openai.createChatCompletion(request);

      return {
        usage: completion.data.usage as CreateCompletionResponseUsage,
        prompt,
        response:
          completion.data.choices[0].message?.content?.trim().replace(/,$/g, "") + "]",
      };
    } catch (error: any) {
      console.log('determineNextAction error', error);
      if (error.response.data.error.message.includes('server error')) {
        // Problem with the OpenAI API, try again
        if (notifyError) {
          notifyError(error.response.data.error.message);
        }
      } else {
        // Another error, give up
        throw new Error(error.response.data.error.message);
      }
    }
  }
  throw new Error(
    `Failed to complete query after ${maxAttempts} attempts. Please try again later.`
  );
}

export function formatPrompt(pageContents: string) {

  return `  
Current time: ${new Date().toLocaleString()}

Current page contents below:
${pageContents}`;
}
