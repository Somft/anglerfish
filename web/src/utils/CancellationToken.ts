export class CancellationToken {
    private shouldContinue: boolean = true;

    cancel = () => { this.shouldContinue = false; }

    continue= () => this.shouldContinue;
}
