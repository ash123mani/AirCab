// Groups: max 4 members, user may belong to many, leave anytime, full = closed.
export const MAX_GROUP_SIZE = 4;

export type Group = {
  id: string;
  areas: string[]; // e.g. ['Velachery'] or ['Velachery','OMR']
  city: string;
  memberIds: string[];
  memberNames: Record<string, string>;
  createdAt: number;
};

let counter = 0;
export function newGroupId(): string {
  counter += 1;
  return `g_${Date.now().toString(36)}_${counter}`;
}

export function canJoin(group: Group): boolean {
  return group.memberIds.length < MAX_GROUP_SIZE;
}

export function joinGroup(group: Group, userId: string, userName: string): Group {
  if (group.memberIds.includes(userId)) return group;
  if (!canJoin(group)) throw new Error('Group is full (4/4).');
  return {
    ...group,
    memberIds: [...group.memberIds, userId],
    memberNames: {...group.memberNames, [userId]: userName},
  };
}

export function leaveGroup(group: Group, userId: string): Group {
  return {
    ...group,
    memberIds: group.memberIds.filter(id => id !== userId),
    memberNames: Object.fromEntries(
      Object.entries(group.memberNames).filter(([id]) => id !== userId),
    ),
  };
}

export function createGroup(city: string, areas: string[], me: {id: string; name: string}): Group {
  return {
    id: newGroupId(),
    city,
    areas: [...areas].sort(),
    memberIds: [me.id],
    memberNames: {[me.id]: me.name},
    createdAt: Date.now(),
  };
}

export function groupLabel(g: Group): string {
  return g.areas.join(' → ');
}
