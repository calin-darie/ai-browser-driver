import { ActionPayload, availableActions } from './availableActions';

export type ParsedAction = {
  name: string;
  args: ReadonlyArray<any>;
}

export type ParsedResponseSuccess = {
  thought: string;
  action:  ActionPayload;
}[];

export type ParsedResponse =
  | ParsedResponseSuccess
  | {
    error: string;
  };
  


export function parseResponse(text: string): ParsedResponse {
  const parsedResponse = JSON.parse(text) as ParsedResponseSuccess;

  return parsedResponse;
}
