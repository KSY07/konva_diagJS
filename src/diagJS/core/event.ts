export type EventType = 'change' | 'input';

export abstract class Event {
    name: string;
    type: EventType;

    constructor(name: string, typ: EventType) {
        this.name = name;
        this.type = typ;
    }
}