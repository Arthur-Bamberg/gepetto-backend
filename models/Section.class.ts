import { Connector } from "../utils/Connector";
import { Message } from "./Message.class";

type Temperature = 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1.0;

export class Section {
    private _idSection?: number;
	private _temperature: Temperature;
	private _name: string;
	private _lastMessage?: Message;
	private _isActive?: boolean;
    private connector: Connector;
}