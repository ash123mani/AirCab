// Chat model: text + timestamps + delivery status, local-first.
export type Delivery = 'queued' | 'sent' | 'delivered' | 'failed';

export type ChatMessage = {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: number;
  status: Delivery;
};

let n = 0;
export function newMessageId(): string {
  n += 1;
  return `m_${Date.now().toString(36)}_${n}`;
}

export function createMessage(
  groupId: string,
  sender: {id: string; name: string},
  text: string,
): ChatMessage {
  const clean = text.trim().slice(0, 500);
  if (!clean) throw new Error('Message is empty.');
  return {
    id: newMessageId(),
    groupId,
    senderId: sender.id,
    senderName: sender.name,
    text: clean,
    createdAt: Date.now(),
    status: 'queued',
  };
}

export function sortMessages(ms: ChatMessage[]): ChatMessage[] {
  return [...ms].sort((a, b) => a.createdAt - b.createdAt);
}
