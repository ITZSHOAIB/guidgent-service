import type { BaseMessage } from "@langchain/core/messages";
import { Annotation, messagesStateReducer } from "@langchain/langgraph";

type ClassLevel = 9 | 10 | -1;

export const graphState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: messagesStateReducer,
    default: () => [],
  }),
  classLevel: Annotation<ClassLevel>({
    reducer: (left: ClassLevel, right: ClassLevel) =>
      left === -1 ? right : left,
    default: () => -1,
  }),
});
