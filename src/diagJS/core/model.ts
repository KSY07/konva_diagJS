import type { ObjectData } from "../types";

export class CoreModel {
    nodeDatas: ObjectData[] = new Array();
    linkDatas: ObjectData[] = [];
    nodeIdKey: string = "nodeId";
    nodeCategoryKey: string = "category";
    linkIdKey: string = "linkId";
    linkFromKey: string = "from";
    linkToKey: string = "to";
    linkCategoryKey: string = "category";
    linkLabelKey: string = "label";
    nodeGroupFlag: string = "isGroup";
    modelData: ObjectData = {};

    constructor(init?:Partial<CoreModel>) {
        init && Object.assign(init);
    }

    addNodeData(nds: ObjectData) {
        this.nodeDatas.push(nds);
    }

    addLinkData(lds: ObjectData) {
        this.linkDatas.push(lds);
    }

    removeNodeData(nodeId: string) {
        const idx = this.nodeDatas.findIndex((e) => e[`${this.nodeIdKey}`] === nodeId);

        if(!idx) {
            throw new Error(`removeNodeData => Not found id key: ${this.nodeIdKey}`);
        }

        this.nodeDatas.splice(idx, 1);
    }

    removeLinkData(linkId: string) {
        const idx = this.linkDatas.findIndex((e) => e[`${this.nodeIdKey}`] === linkId);

        if(!idx) {
            throw new Error(`removeNodeData => Not found id key: ${this.nodeIdKey}`);
        }

        this.linkDatas.splice(idx, 1);
    }
}