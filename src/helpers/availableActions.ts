export const availableActions = [
  {
    name: 'click',
    description: 'Clicks on an element',
    exampleThought: 'Submit the address and continue to payment', 
    args: [
      {
        name: 'elementId',
        type: 'number',
        example: 223
      },
    ],
  },
  {
    name: 'setValue',
    description: 'Focuses on and sets the value of an input element',
    exampleThought: 'Search for "yellow toy trucks"', 
    args: [
      {
        name: 'elementId',
        type: 'number',
        example: 78
      },
      {
        name: 'value',
        type: 'string',
        example: 'this is my text'
      },
    ],
  },
  {
    name: 'finish',
    description: 'Indicates the task is finished',
    exampleThought: 'I have found the requested info. Earth - Sun distance is 149.6 milion km.', 
    args: [],
  },
  {
    name: 'fail',
    description: 'Indicates that you are unable to complete the task',
    exampleThought: 'I cannot figure out how to continue', 
    args: [],
  },
] as const;

type AvailableAction = (typeof availableActions)[number];

type ArgsToObject<T extends ReadonlyArray<{ name: string; type: string }>> = {
  [K in T[number]['name']]: Extract<
    T[number],
    { name: K }
  >['type'] extends 'number'
    ? number
    : string;
};

export type ActionShape<
  T extends {
    name: string;
    args: ReadonlyArray<{ name: string; type: string }>;
  }
> = {
  name: T['name'];
  args: ArgsToObject<T['args']>;
};

export type ActionPayload = {
  [K in AvailableAction['name']]: ActionShape<
    Extract<AvailableAction, { name: K }>
  >;
}[AvailableAction['name']];
