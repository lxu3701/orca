// One room turn's own rows, read once by its operation when its reader opens it.
import type { AgentJournalRenderItem } from '../../shared/agent-session/journal/agent-session-journal-types'
import { botChatReads } from './bot-chat-reads'
import type { BotGroupRuntime } from './bot-group-runtime'

/** The room page draws an ended turn from its saved reply, never from its member chat. */
export async function readBotGroupTurnRows(
  groups: BotGroupRuntime,
  groupId: string,
  operationId: string
): Promise<{ items: AgentJournalRenderItem[] }> {
  const message = groups.store.operationMessage(operationId)
  const turn = message?.turns.find((candidate) => candidate.operationId === operationId)
  if (!message || message.groupId !== groupId || !turn) {
    return { items: [] }
  }
  if (turn.frozenItems) {
    return { items: turn.frozenItems }
  }
  const read = await botChatReads(groups.runtime).turnItems(turn.sessionId, [turn])
  return { items: read.get(operationId) ?? [] }
}
