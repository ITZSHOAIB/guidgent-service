import type { graphState } from "../graphState";
import type { SendDataType } from "../langgraph.service";

export async function askClassLevel(
  state: typeof graphState.State,
  sendData: (data: SendDataType) => void
) {
  console.log("Node Visited: [askClassLevel]");
  if (sendData) {
    sendData({
      type: "chat",
      text: "Hello! To provide you with the most relevant information, could you please tell me if you are in class 9 or 10?",
    });

    sendData({
      type: "end",
    });
  }
  return;
}
