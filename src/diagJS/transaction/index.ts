import { CoreCanvas } from "../core/canvas"
import { GraphLinksModel, Model } from "../model";
import type { ObjectData } from "../types";

export enum ChangeType {
    Insert = 1,
    Remove = 2,
    Property = 3,
    Transaction = 4
}

export class ChangedEvent {
    change?: ChangeType;
    canvas?: CoreCanvas;
    model?: Model;
    modelChange: string = "";
    newParam: any;
    newValue: any;
    object: ObjectData = {};
    isTransactionFinished: boolean = false;
    oldParam: any;
    oldValue: any;
    propertyName: string | ((a: ObjectData, b:any) => any) = "";

    constructor(init?: Partial<ChangedEvent>) {
        if (init) Object.assign(this, init);
    }

    canRedo(): boolean {
        return this.change !== undefined;
    }

    canUndo(): boolean {
        return this.change !== undefined;
    }

    clear(): void {
        this.change = undefined;
        this.modelChange = "";
        this.object = {};
        this.oldValue = undefined;
        this.newValue = undefined;
        this.oldParam = undefined;
        this.newParam = undefined;
    }

    copy(): ChangedEvent {
        const evt = new ChangedEvent();
        evt.change = this.change;
        evt.canvas = this.canvas;
        evt.model = this.model;
        evt.modelChange = this.modelChange;
        evt.object = this.object;
        evt.propertyName = this.propertyName;
        evt.oldValue = this.oldValue;
        evt.newValue = this.newValue;
        evt.oldParam = this.oldParam;
        evt.newParam = this.newParam;
        evt.isTransactionFinished = this.isTransactionFinished;
        return evt;
    }

    getParam(undo: boolean): any {
        return undo ? this.oldParam : this.newParam;
    }

    getValue(undo: boolean): any {
        return undo ? this.oldValue : this.newValue;
    }

    redo(): void {
        if (!this.canRedo()) return;
        this.execute(false);
    }

    undo(): void {
        if (!this.canUndo()) return;
        this.execute(true);
    }

    private execute(undo: boolean): void {
        const value = this.getValue(undo);
        const param = this.getParam(undo);
        
        console.log(`Executing ${undo ? 'undo' : 'redo'}:`, this.change, this.propertyName, value);

        // 직접 데이터 수정 후 UI 업데이트만 트리거 (이벤트 생성하지 않음)
        switch (this.change) {
            case ChangeType.Property:
                if (typeof this.propertyName === 'string') {
                    console.log(`Setting ${this.propertyName} to:`, value);
                    this.object[this.propertyName] = value;
                    
                    // Canvas를 통해 UI 업데이트 (이벤트는 생성하지 않음)
                    if (this.canvas) {
                        //this.canvas.updateNodeOrLinkFromData(this.object);
                    }
                } else if (typeof this.propertyName === 'function') {
                    this.propertyName(this.object, value);
                }
                break;
            
            case ChangeType.Insert:
                if (this.model) {
                    if (this.modelChange === 'nodeDataArray') {
                        if (undo) {
                            const index = this.model.nodeDataArray.indexOf(value);
                            if (index >= 0) this.model.nodeDataArray.splice(index, 1);
                            // UI에서 노드 제거
                            if (this.canvas) {
                                //this.canvas.removeNodeFromData(value);
                            }
                        } else {
                            this.model.nodeDataArray.push(value);
                            // UI에 노드 추가
                            if (this.canvas) {
                                //this.canvas.createNodeFromData(value);
                            }
                        }
                    } else if (this.modelChange === 'linkDataArray' && this.model instanceof GraphLinksModel) {
                        if (undo) {
                            const index = this.model.linkDataArray.indexOf(value);
                            if (index >= 0) this.model.linkDataArray.splice(index, 1);
                            // UI에서 링크 제거
                            if (this.canvas) {
                                //this.canvas.removeLinkFromData(value);
                            }
                        } else {
                            this.model.linkDataArray.push(value);
                            // UI에 링크 추가
                            if (this.canvas) {
                                //this.canvas.createLinkFromData(value);
                            }
                        }
                    }
                }
                break;
            
            case ChangeType.Remove:
                if (this.model) {
                    if (this.modelChange === 'nodeDataArray') {
                        if (undo) {
                            this.model.nodeDataArray.push(value);
                            // UI에 노드 추가
                            if (this.canvas) {
                                //this.canvas.createNodeFromData(value);
                            }
                        } else {
                            const index = this.model.nodeDataArray.indexOf(value);
                            if (index >= 0) this.model.nodeDataArray.splice(index, 1);
                            // UI에서 노드 제거
                            if (this.canvas) {
                                //this.canvas.removeNodeFromData(value);
                            }
                        }
                    } else if (this.modelChange === 'linkDataArray' && this.model instanceof GraphLinksModel) {
                        if (undo) {
                            this.model.linkDataArray.push(value);
                            // UI에 링크 추가
                            if (this.canvas) {
                                //this.canvas.createLinkFromData(value);
                            }
                        } else {
                            const index = this.model.linkDataArray.indexOf(value);
                            if (index >= 0) this.model.linkDataArray.splice(index, 1);
                            // UI에서 링크 제거
                            if (this.canvas) {
                                //this.canvas.removeLinkFromData(value);
                            }
                        }
                    }
                }
                break;
        }
    }
}

export class Transaction {
    changes: ChangedEvent[] = [];
    isComplete: boolean = false;
    name: string = "";
    
    constructor(name?: string) {
        this.name = name || "";
    }

    canRedo(): boolean {
        return this.changes.every(e => e.canRedo());
    }

    canUndo(): boolean {
        return this.changes.every(e => e.canUndo());
    }

    clear(): void {
        this.changes.forEach(e => e.clear());
        this.changes = [];
        this.isComplete = false;
    }

    optimize(): void {
        // 중복되거나 취소되는 변경사항을 최적화
        const optimized: ChangedEvent[] = [];
        const propertyChanges = new Map<string, ChangedEvent>();

        for (const change of this.changes) {
            if (change.change === ChangeType.Property && typeof change.propertyName === 'string') {
                const key = `${change.object}-${change.propertyName}`;
                const existing = propertyChanges.get(key);
                if (existing) {
                    // 동일한 속성에 대한 변경은 최신 값만 유지
                    existing.newValue = change.newValue;
                } else {
                    propertyChanges.set(key, change);
                    optimized.push(change);
                }
            } else {
                optimized.push(change);
            }
        }

        this.changes = optimized;
    }

    redo(): void {
        if (!this.canRedo()) return;
        for (const change of this.changes) {
            change.redo();
        }
    }

    undo(): void {
        if (!this.canUndo()) return;
        // 역순으로 실행
        for (let i = this.changes.length - 1; i >= 0; i--) {
            this.changes[i].undo();
        }
    }
}

export class UndoManager {
    currentTransaction: Transaction | null = null;
    history: Transaction[] = [];
    historyIndex: number = -1;
    isEnabled: boolean = true;
    isInTransaction: boolean = false;
    isUndoingRedoing: boolean = false;
    maxHistoryLength: number = 999;
    models: Model[] = [];
    nestedTransactionNames: string[] = [];
    transactionLevel: number = 0;
    transactionToRedo: Transaction | null = null;
    transactionToUndo: Transaction | null = null;

    constructor(init?: Partial<UndoManager>) {
        if (init) Object.assign(this, init);
    }

    addModel(model: Model): void {
        if (!this.models.includes(model)) {
            this.models.push(model);
            model.undoManager = this;
        }
    }

    removeModel(model: Model): void {
        const index = this.models.indexOf(model);
        if (index >= 0) {
            this.models.splice(index, 1);
            model.undoManager = null;
        }
    }

    canRedo(): boolean {
        if (!this.isEnabled) return false;
        if (this.isInTransaction || this.isUndoingRedoing) return false;
        return this.historyIndex < this.history.length - 1;
    }

    canUndo(): boolean {
        if (!this.isEnabled) return false;
        if (this.isInTransaction || this.isUndoingRedoing) return false;
        return this.historyIndex >= 0;
    }

    startTransaction(name?: string): boolean {
        if (!this.isEnabled) return false;

        this.transactionLevel++;
        this.isInTransaction = true;
        this.nestedTransactionNames.push(name || "");

        if (this.transactionLevel === 1) {
            // 최상위 트랜잭션 시작
            this.currentTransaction = new Transaction(name);
            return true;
        }
        return false;
    }

    commitTransaction(name?: string): boolean {
        if (!this.isEnabled || this.transactionLevel === 0) return false;

        const expectedName = this.nestedTransactionNames[this.nestedTransactionNames.length - 1];
        if (name !== undefined && name !== expectedName) {
            console.warn(`Transaction name mismatch: expected "${expectedName}", got "${name}"`);
        }

        this.nestedTransactionNames.pop();
        this.transactionLevel--;

        if (this.transactionLevel === 0) {
            // 최상위 트랜잭션 완료
            this.isInTransaction = false;
            
            if (this.currentTransaction && this.currentTransaction.changes.length > 0) {
                this.currentTransaction.isComplete = true;
                this.currentTransaction.optimize();
                
                // 현재 위치 이후의 history 제거 (redo 불가능하게)
                this.history = this.history.slice(0, this.historyIndex + 1);
                
                // 새 트랜잭션 추가
                this.history.push(this.currentTransaction);
                this.historyIndex++;
                
                // 최대 히스토리 길이 제한
                if (this.history.length > this.maxHistoryLength) {
                    this.history.shift();
                    this.historyIndex--;
                }
                
                // 트랜잭션 완료 이벤트
                const finishedEvent = new ChangedEvent({
                    change: ChangeType.Transaction,
                    isTransactionFinished: true,
                    object: this.currentTransaction as any
                });
                this.models.forEach(model => model.raiseChangedEvent(finishedEvent));
            }
            
            this.currentTransaction = null;
            return true;
        }
        
        return false;
    }

    rollbackTransaction(): boolean {
        if (!this.isEnabled || this.transactionLevel === 0) return false;

        this.nestedTransactionNames.pop();
        this.transactionLevel--;

        if (this.transactionLevel === 0) {
            this.isInTransaction = false;
            
            if (this.currentTransaction) {
                // 현재 트랜잭션의 모든 변경사항 되돌리기
                this.currentTransaction.undo();
                this.currentTransaction = null;
            }
            return true;
        }
        
        return false;
    }

    undo(): boolean {
        console.log('UndoManager.undo() called, canUndo:', this.canUndo());
        if (!this.canUndo()) return false;

        this.isUndoingRedoing = true;
        const transaction = this.history[this.historyIndex];
        this.transactionToUndo = transaction;
        
        console.log('Undoing transaction:', transaction.name, 'changes:', transaction.changes.length);
        transaction.undo();
        this.historyIndex--;
        
        this.transactionToUndo = null;
        this.isUndoingRedoing = false;
        console.log('Undo completed, new historyIndex:', this.historyIndex);
        return true;
    }

    redo(): boolean {
        if (!this.canRedo()) return false;

        this.isUndoingRedoing = true;
        this.historyIndex++;
        const transaction = this.history[this.historyIndex];
        this.transactionToRedo = transaction;
        
        transaction.redo();
        
        this.transactionToRedo = null;
        this.isUndoingRedoing = false;
        return true;
    }

    clear(): void {
        this.history.forEach(t => t.clear());
        this.history = [];
        this.historyIndex = -1;
        this.currentTransaction = null;
        this.transactionLevel = 0;
        this.isInTransaction = false;
        this.nestedTransactionNames = [];
    }

    handleChanged(e: ChangedEvent): void {
        if (!this.isEnabled || !this.isInTransaction) return;
        if (!this.currentTransaction) return;
        
        // 현재 트랜잭션에 변경사항 추가
        this.currentTransaction.changes.push(e.copy());
    }

    skipsEvent(e: ChangedEvent): boolean {
        // 무시할 이벤트 판단 (예: 임시 변경사항)
        if (!e.change) return true;
        if (e.isTransactionFinished) return true;
        return false;
    }
}