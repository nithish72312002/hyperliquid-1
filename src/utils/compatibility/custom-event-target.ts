// DOM Event phase constants
const EVENT_NONE = 0 as const;
const EVENT_CAPTURING_PHASE = 1 as const;
const EVENT_AT_TARGET = 2 as const;
const EVENT_BUBBLING_PHASE = 3 as const;

// Create our own Event class if it doesn't exist in the environment
export class Event {
  public readonly type: string;
  public readonly bubbles: boolean;
  public readonly cancelable: boolean;
  private _defaultPrevented: boolean = false;
  
  // These are not used in our implementation but needed for type compatibility with DOM Event
  readonly NONE: typeof EVENT_NONE = EVENT_NONE;
  readonly CAPTURING_PHASE: typeof EVENT_CAPTURING_PHASE = EVENT_CAPTURING_PHASE;
  readonly AT_TARGET: typeof EVENT_AT_TARGET = EVENT_AT_TARGET;
  readonly BUBBLING_PHASE: typeof EVENT_BUBBLING_PHASE = EVENT_BUBBLING_PHASE;
  readonly eventPhase: typeof EVENT_NONE = EVENT_NONE;
  
  // Other DOM Event properties and methods
  readonly composedPath = () => [];
  readonly stopPropagation = () => {};
  readonly stopImmediatePropagation = () => {};
  readonly currentTarget: any = null;
  readonly target: any = null;
  readonly returnValue: boolean = true;
  readonly isTrusted: boolean = true;
  readonly timeStamp: number = Date.now();
  readonly srcElement: any = null;
  readonly cancelBubble: boolean = false;
  readonly composed: boolean = false;
  
  // For compatibility with the DOM Event interface
  initEvent(type: string, bubbles?: boolean, cancelable?: boolean): void {
    // This is a no-op as we handle all this in the constructor
  }
  
  constructor(type: string, eventInitDict?: EventInit) {
    this.type = type;
    this.bubbles = eventInitDict?.bubbles || false;
    this.cancelable = eventInitDict?.cancelable || false;
  }

  preventDefault(): void {
    if (this.cancelable) {
      this._defaultPrevented = true;
    }
  }

  get defaultPrevented(): boolean {
    return this._defaultPrevented;
  }
}

/**
 * A simplified CustomEvent implementation that works in all environments
 */
export class CustomEvent<T = any> extends Event {
  public readonly detail: T;
  
  // For type compatibility with DOM CustomEvent
  initCustomEvent(type: string, bubbles?: boolean, cancelable?: boolean, detail?: T): void {
    // This is a no-op as we handle all this in the constructor
  }

  constructor(type: string, eventInitDict?: CustomEventInit<T>) {
    super(type, eventInitDict);
    this.detail = eventInitDict?.detail as T;
  }
}

/**
 * A listener for a typed event.
 */
export type TypedEventListener<M, T extends keyof M> = (
  evt: M[T]
) => void | Promise<void>;

/**
 * A listener object for a typed event.
 */
export interface TypedEventListenerObject<M, T extends keyof M> {
  handleEvent: (evt: M[T]) => void | Promise<void>;
}

/**
 * A listener or listener object for a typed event.
 */
export type TypedEventListenerOrEventListenerObject<M, T extends keyof M> =
  | TypedEventListener<M, T>
  | TypedEventListenerObject<M, T>;

/**
 * Options for adding an event listener.
 */
export interface AddEventListenerOptions extends EventListenerOptions {
  once?: boolean;
  passive?: boolean;
}

/**
 * Options for event listeners.
 */
export interface EventListenerOptions {
  capture?: boolean;
}

// Type constraint to ensure all properties in M are Event types
type ValueIsEvent<T> = {
  [key in keyof T]: Event;
};

/**
 * A custom TypedEventTarget implementation compatible with React Native
 * Provides the same interface as the DOM EventTarget, but with type checking
 */
export class TypedEventTarget<M extends ValueIsEvent<M>> {
  private listeners: Map<string, Array<{
    callback: TypedEventListenerOrEventListenerObject<M, any>;
    options?: boolean | AddEventListenerOptions;
  }>> = new Map();

  /**
   * Add an event listener.
   */
  public addEventListener<T extends keyof M & string>(
    type: T,
    callback: TypedEventListenerOrEventListenerObject<M, T> | null,
    options?: boolean | AddEventListenerOptions
  ): void {
    if (!callback) return;

    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }

    this.listeners.get(type)!.push({ callback, options });
  }

  /**
   * Remove an event listener.
   */
  public removeEventListener<T extends keyof M & string>(
    type: T,
    callback: TypedEventListenerOrEventListenerObject<M, T> | null,
    _options?: boolean | EventListenerOptions
  ): void {
    if (!callback) return;

    const listeners = this.listeners.get(type);
    if (!listeners) return;

    // Filter out the matching callback
    const filtered = listeners.filter(listener => listener.callback !== callback);
    
    if (filtered.length > 0) {
      this.listeners.set(type, filtered);
    } else {
      this.listeners.delete(type);
    }
  }

  /**
   * Dispatch an event.
   */
  public dispatchEvent(event: Event): boolean {
    const listeners = this.listeners.get(event.type) || [];
    
    for (const listener of listeners) {
      try {
        if (typeof listener.callback === 'function') {
          // Cast the event to the expected type for this event listener
          // This is safe because we're mapping event types to their corresponding event classes
          (listener.callback as Function)(event);
        } else {
          // Cast the event to the expected type for this event listener object
          (listener.callback.handleEvent as Function)(event);
        }
        
        // Handle once option
        if (listener.options && 
            typeof listener.options === 'object' && 
            listener.options.once) {
          this.removeEventListener(event.type as any, listener.callback);
        }
      } catch (e) {
        console.error(`Error in event listener for ${event.type}:`, e);
      }
    }
    
    return !event.defaultPrevented;
  }

  /**
   * Dispatches a typed event.
   */
  public dispatchTypedEvent<T extends keyof M>(
    _type: T,
    event: M[T]
  ): boolean {
    return this.dispatchEvent(event as Event);
  }
}

// For compatibility with existing code - conditionally define globals
try {
  if (typeof globalThis.CustomEvent === 'undefined') {
    (globalThis as any).CustomEvent = CustomEvent;
  }

  if (typeof globalThis.Event === 'undefined') {
    (globalThis as any).Event = Event;
  }
} catch (e) {
  // Some environments might restrict global modifications
  console.warn('Could not define global Event polyfills:', e);
}
