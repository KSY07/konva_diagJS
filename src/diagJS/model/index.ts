import type { Key, ObjectData } from "../types";
import { generateId } from "../utils/utils";
import { ChangedEvent, ChangeType, UndoManager } from "../transaction";

export enum BindingMode {
    OneWay = 1,
    TwoWay = 2
}

export class Binding {
    backConverter?: ((val: any, sourceData: any, model: Model) => any); // 사용자 입력 => 모델 컨버터
    converter?: ((val: any, targetObj: any) => any); // 모델 => 사용자 입력 컨버터
    isToData: boolean = false;
    isToModel: boolean = false;
    isToObject: boolean = false;
    isToTheme: boolean = false;
    mode: BindingMode = BindingMode.OneWay;
    targetProperty: string = ""; // 바인딩이 설정할 속성 이름 (노드 자체의 속성을 의미함.)
    sourceProperty: string = ""; // 데이터에서 가져올 속성 명 (노드 / 링크 > nodeDataArray, linkDataArray에 들어감.)
    sourceName: string = ""; // 가져올 소스 데이터 이름 (노드 / 링크 데이터)

    constructor(init?: Partial<Binding>) {
        if (init) Object.assign(this, init);
    }
}

export class Model {
    makeId: (model: any, data: any) => string = (model, data) => generateId("node");
    nodeDataArray: ObjectData[] = [];
    nodeKeyProperty: string | ((a:ObjectData, b?: Key) => Key) = "id"; // 노드 데이터에서 노드의 Key가 되는 Property Key를 지정. (key-value)
    nodeCategoryProperty: string | ((a:ObjectData, b?: string) => string) = "category"; // 노드 데이터에서 노드의 카테고리를 지정하는 Property의 Key를 지정. (key-value)
    isReadOnly: boolean = false;
    pointsDigits: number = 3; // 숫자 데이터의 소수점 자리를 지정.
    modelData?: ObjectData; // 모델에 지정할 커스텀 데이터들을 저장할 필드
    // UndoManager
    skipsUndoManager: boolean = false;
    undoManager: UndoManager | null = null;
    // Canvas reference for UI updates
    canvas?: any;
    // Event listeners
    private changedListeners: ((e: ChangedEvent) => void)[] = [];

    constructor(datas?: ObjectData[], init?: Partial<Model>) {
        if(datas) {
            this.nodeDataArray = datas;
        }

        init && Object.assign(this, init);
    }

    raiseChangedEvent(e: ChangedEvent): void {
        // UndoManager에 이벤트 전달 (Undo/Redo 중이 아닐 때만)
        if (!this.skipsUndoManager && this.undoManager && !this.undoManager.skipsEvent(e) && !this.undoManager.isUndoingRedoing) {
            this.undoManager.handleChanged(e);
        }

        // 리스너들에게 이벤트 전달
        this.changedListeners.forEach(listener => listener(e));
    }

    addChangedListener(listener: (e: ChangedEvent) => void): void {
        this.changedListeners.push(listener);
    }

    removeChangedListener(listener: (e: ChangedEvent) => void): void {
        const index = this.changedListeners.indexOf(listener);
        if (index >= 0) {
            this.changedListeners.splice(index, 1);
        }
    }

    startTransaction(name?: string): boolean {
        if (this.undoManager) {
            return this.undoManager.startTransaction(name);
        }
        return false;
    }

    commitTransaction(name?: string): boolean {
        if (this.undoManager) {
            return this.undoManager.commitTransaction(name);
        }
        return false;
    }

    rollbackTransaction(): boolean {
        if (this.undoManager) {
            return this.undoManager.rollbackTransaction();
        }
        return false;
    }

    addNodeData(nodeData: ObjectData): void {
        if (this.isReadOnly) return;

        this.startTransaction("Add Node");
        
        const key = this.getNodeKey(nodeData);
        if (!key) {
            const newKey = this.makeId(this, nodeData);
            this.setNodeKey(nodeData, newKey);
        }

        this.nodeDataArray.push(nodeData);
        
        this.raiseChangedEvent(new ChangedEvent({
            change: ChangeType.Insert,
            model: this,
            canvas: this.canvas,
            modelChange: "nodeDataArray",
            newValue: nodeData,
            object: nodeData
        }));

        this.commitTransaction("Add Node");
    }

    removeNodeData(nodeData: ObjectData): void {
        if (this.isReadOnly) return;

        this.startTransaction("Remove Node");
        
        const index = this.nodeDataArray.indexOf(nodeData);
        if (index >= 0) {
            this.nodeDataArray.splice(index, 1);
            
            this.raiseChangedEvent(new ChangedEvent({
                change: ChangeType.Remove,
                model: this,
                canvas: this.canvas,
                modelChange: "nodeDataArray",
                oldValue: nodeData,
                object: nodeData
            }));
        }

        this.commitTransaction("Remove Node");
    }

    setDataProperty(data: ObjectData, propertyName: string, value: any): void {
        if (this.isReadOnly) return;

        const oldValue = data[propertyName];
        if (oldValue === value) return;

        data[propertyName] = value;
        
        this.raiseChangedEvent(new ChangedEvent({
            change: ChangeType.Property,
            model: this,
            canvas: this.canvas,
            object: data,
            propertyName: propertyName,
            oldValue: oldValue,
            newValue: value
        }));
    }

    getNodeKey(nodeData: ObjectData): Key | undefined {
        if (typeof this.nodeKeyProperty === 'string') {
            return nodeData[this.nodeKeyProperty];
        } else if (typeof this.nodeKeyProperty === 'function') {
            return this.nodeKeyProperty(nodeData);
        }
        return undefined;
    }

    setNodeKey(nodeData: ObjectData, key: Key): void {
        if (typeof this.nodeKeyProperty === 'string') {
            const oldKey = nodeData[this.nodeKeyProperty];
            nodeData[this.nodeKeyProperty] = key;
            
            this.raiseChangedEvent(new ChangedEvent({
                change: ChangeType.Property,
                model: this,
                canvas: this.canvas,
                modelChange: "nodeKey",
                object: nodeData,
                propertyName: this.nodeKeyProperty,
                oldValue: oldKey,
                newValue: key
            }));
        } else if (typeof this.nodeKeyProperty === 'function') {
            this.nodeKeyProperty(nodeData, key);
        }
    }

    getNodeCategory(nodeData: ObjectData): string | undefined {
        if (typeof this.nodeCategoryProperty === 'string') {
            return nodeData[this.nodeCategoryProperty];
        } else if (typeof this.nodeCategoryProperty === 'function') {
            return this.nodeCategoryProperty(nodeData);
        }
        return undefined;
    }

    setNodeCategory(nodeData: ObjectData, category: string): void {
        if (typeof this.nodeCategoryProperty === 'string') {
            const oldCategory = nodeData[this.nodeCategoryProperty];
            nodeData[this.nodeCategoryProperty] = category;
            
            this.raiseChangedEvent(new ChangedEvent({
                change: ChangeType.Property,
                model: this,
                canvas: this.canvas,
                modelChange: "nodeCategory",
                object: nodeData,
                propertyName: this.nodeCategoryProperty,
                oldValue: oldCategory,
                newValue: category
            }));
        } else if (typeof this.nodeCategoryProperty === 'function') {
            this.nodeCategoryProperty(nodeData, category);
        }
    }

    clear(): void {
        if (this.isReadOnly) return;

        this.startTransaction("Clear Model");
        
        const oldNodes = [...this.nodeDataArray];
        this.nodeDataArray = [];
        
        oldNodes.forEach(node => {
            this.raiseChangedEvent(new ChangedEvent({
                change: ChangeType.Remove,
                model: this,
                canvas: this.canvas,
                modelChange: "nodeDataArray",
                oldValue: node,
                object: node
            }));
        });

        this.commitTransaction("Clear Model");
    }

    toJson(): string {
        return JSON.stringify({
            class: this.constructor.name,
            nodeDataArray: this.nodeDataArray,
            modelData: this.modelData
        });
    }

    fromJson(json: string): void {
        if (this.isReadOnly) return;

        this.startTransaction("Load Model");
        
        const data = JSON.parse(json);
        
        this.clear();
        
        if (data.nodeDataArray) {
            data.nodeDataArray.forEach(nodeData => {
                this.addNodeData(nodeData);
            });
        }
        
        if (data.modelData) {
            this.modelData = data.modelData;
        }

        this.commitTransaction("Load Model");
    }
}

export class GraphLinksModel extends Model {
    makeLinkId: (model: any, data: any) => string = (model, data) => generateId("link");
    linkDataArray: ObjectData[] = [];
    linkCategoryProperty: string | ((a: ObjectData, b?: string) => string) = "category";
    linkLabelKeysProperty?: string | ((a: ObjectData, b?:Key[]) => Key[]);
    linkFromKeyProperty: string | ((a: ObjectData, b?: Key) => Key) = "from";
    linkFromPortIdProperty: string | ((a: ObjectData, b?: string) => string) = "fromPort";
    linkToKeyProperty: string | ((a: ObjectData, b?: Key) => Key) = "to";
    linkToPortIdProperty: string | ((a: ObjectData, b?: string) => string) = "toPort";
    nodeGroupKeyProperty: string | ((a: ObjectData, b?: Key) => Key) = "group";
    nodeIsGroupProperty: string | ((a: ObjectData, b?: boolean) => boolean) = "isGroup";
    archetypeNodeData: ObjectData | null = null; // 존재하지 않는 노드 참조시 자동 생성 템플릿

    addLinkData(linkData: ObjectData): void {
        if (this.isReadOnly) return;

        this.startTransaction("Add Link");
        
        const key = this.getLinkKey(linkData);
        if (!key) {
            const newKey = this.makeLinkId(this, linkData);
            this.setLinkKey(linkData, newKey);
        }

        // archetypeNodeData를 사용한 노드 자동 생성
        const fromKey = this.getLinkFromKey(linkData);
        const toKey = this.getLinkToKey(linkData);
        
        if (fromKey && !this.findNodeDataForKey(fromKey) && this.archetypeNodeData) {
            const newNode = { ...this.archetypeNodeData };
            this.setNodeKey(newNode, fromKey);
            this.addNodeData(newNode);
        }
        
        if (toKey && !this.findNodeDataForKey(toKey) && this.archetypeNodeData) {
            const newNode = { ...this.archetypeNodeData };
            this.setNodeKey(newNode, toKey);
            this.addNodeData(newNode);
        }

        this.linkDataArray.push(linkData);
        
        this.raiseChangedEvent(new ChangedEvent({
            change: ChangeType.Insert,
            model: this,
            canvas: this.canvas,
            modelChange: "linkDataArray",
            newValue: linkData,
            object: linkData
        }));

        this.commitTransaction("Add Link");
    }

    removeLinkData(linkData: ObjectData): void {
        if (this.isReadOnly) return;

        this.startTransaction("Remove Link");
        
        const index = this.linkDataArray.indexOf(linkData);
        if (index >= 0) {
            this.linkDataArray.splice(index, 1);
            
            this.raiseChangedEvent(new ChangedEvent({
                change: ChangeType.Remove,
                model: this,
                canvas: this.canvas,
                modelChange: "linkDataArray",
                oldValue: linkData,
                object: linkData
            }));
        }

        this.commitTransaction("Remove Link");
    }

    getLinkKey(linkData: ObjectData): Key | undefined {
        return linkData.key;
    }

    setLinkKey(linkData: ObjectData, key: Key): void {
        const oldKey = linkData.key;
        linkData.key = key;
        
        this.raiseChangedEvent(new ChangedEvent({
            change: ChangeType.Property,
            model: this,
            canvas: this.canvas,
            modelChange: "linkKey",
            object: linkData,
            propertyName: "key",
            oldValue: oldKey,
            newValue: key
        }));
    }

    getLinkFromKey(linkData: ObjectData): Key | undefined {
        if (typeof this.linkFromKeyProperty === 'string') {
            return linkData[this.linkFromKeyProperty];
        } else if (typeof this.linkFromKeyProperty === 'function') {
            return this.linkFromKeyProperty(linkData);
        }
        return undefined;
    }

    setLinkFromKey(linkData: ObjectData, key: Key): void {
        if (typeof this.linkFromKeyProperty === 'string') {
            const oldKey = linkData[this.linkFromKeyProperty];
            linkData[this.linkFromKeyProperty] = key;
            
            this.raiseChangedEvent(new ChangedEvent({
                change: ChangeType.Property,
                model: this,
                canvas: this.canvas,
                modelChange: "linkFromKey",
                object: linkData,
                propertyName: this.linkFromKeyProperty,
                oldValue: oldKey,
                newValue: key
            }));
        } else if (typeof this.linkFromKeyProperty === 'function') {
            this.linkFromKeyProperty(linkData, key);
        }
    }

    getLinkToKey(linkData: ObjectData): Key | undefined {
        if (typeof this.linkToKeyProperty === 'string') {
            return linkData[this.linkToKeyProperty];
        } else if (typeof this.linkToKeyProperty === 'function') {
            return this.linkToKeyProperty(linkData);
        }
        return undefined;
    }

    setLinkToKey(linkData: ObjectData, key: Key): void {
        if (typeof this.linkToKeyProperty === 'string') {
            const oldKey = linkData[this.linkToKeyProperty];
            linkData[this.linkToKeyProperty] = key;
            
            this.raiseChangedEvent(new ChangedEvent({
                change: ChangeType.Property,
                model: this,
                canvas: this.canvas,
                modelChange: "linkToKey",
                object: linkData,
                propertyName: this.linkToKeyProperty,
                oldValue: oldKey,
                newValue: key
            }));
        } else if (typeof this.linkToKeyProperty === 'function') {
            this.linkToKeyProperty(linkData, key);
        }
    }

    findNodeDataForKey(key: Key): ObjectData | null {
        for (const node of this.nodeDataArray) {
            if (this.getNodeKey(node) === key) {
                return node;
            }
        }
        return null;
    }

    findLinkDataForKey(key: Key): ObjectData | null {
        for (const link of this.linkDataArray) {
            if (this.getLinkKey(link) === key) {
                return link;
            }
        }
        return null;
    }

    override clear(): void {
        if (this.isReadOnly) return;

        this.startTransaction("Clear Model");
        
        const oldNodes = [...this.nodeDataArray];
        const oldLinks = [...this.linkDataArray];
        
        this.nodeDataArray = [];
        this.linkDataArray = [];
        
        oldLinks.forEach(link => {
            this.raiseChangedEvent(new ChangedEvent({
                change: ChangeType.Remove,
                model: this,
                canvas: this.canvas,
                modelChange: "linkDataArray",
                oldValue: link,
                object: link
            }));
        });
        
        oldNodes.forEach(node => {
            this.raiseChangedEvent(new ChangedEvent({
                change: ChangeType.Remove,
                model: this,
                canvas: this.canvas,
                modelChange: "nodeDataArray",
                oldValue: node,
                object: node
            }));
        });

        this.commitTransaction("Clear Model");
    }

    override toJson(): string {
        return JSON.stringify({
            class: this.constructor.name,
            nodeDataArray: this.nodeDataArray,
            linkDataArray: this.linkDataArray,
            modelData: this.modelData
        });
    }

    override fromJson(json: string): void {
        if (this.isReadOnly) return;

        this.startTransaction("Load Model");
        
        const data = JSON.parse(json);
        
        this.clear();
        
        if (data.nodeDataArray) {
            data.nodeDataArray.forEach(nodeData => {
                this.addNodeData(nodeData);
            });
        }
        
        if (data.linkDataArray) {
            data.linkDataArray.forEach(linkData => {
                this.addLinkData(linkData);
            });
        }
        
        if (data.modelData) {
            this.modelData = data.modelData;
        }

        this.commitTransaction("Load Model");
    }
}

export class TreeModel extends Model {
    nodeParentKeyProperty?: string | ((a: ObjectData, b?: Key) => Key); // 부모를 나타내는 키의 이름
    parentLinkCategoryProperty?: string |((a: ObjectData, b?: string) => string); // 부모와 링크를 위한 링크의 카테고리 키 이름 지정
}