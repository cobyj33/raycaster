type Action = () => void;
type DocEvent = [string, (event: any) => void];

export class PointerLockEvents {
    onLockedEvents: DocEvent[];
    onError: Action;
    target: HTMLElement;


    constructor( onLocked: DocEvent[], target: HTMLElement, onError?: Action  ) {
        this.onLockedEvents = onLocked;
        this.target = target;
        this.onError = onError ?? (() => console.error("POINTER LOCK ERROR"));
    }

    private onChange() {
        if (document.pointerLockElement === this.target) {
            this.onLockedEvents.forEach(lockEvent => {
                document.addEventListener(lockEvent[0], lockEvent[1]);
            })
        } else if (document.pointerLockElement !== this.target) {
            this.onLockedEvents.forEach(lockEvent => {
                document.removeEventListener(lockEvent[0], lockEvent[1]);
            })
        }
    }

    bind() {
        this.target.requestPointerLock();
        document.addEventListener('pointerlockchange', this.onChange.bind(this));
        document.addEventListener('pointerlockerror', this.onError.bind(this));
    }

    dispose() {
        document.removeEventListener('pointerlockchange', this.onChange.bind(this))
        document.removeEventListener('pointerlockerror', this.onError.bind(this))
    }
}
