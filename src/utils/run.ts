import { v4 as uuidv4 } from "uuid";

class Node {

    /*
     * Four quadrants of a node.
     *
     *      nw, ne,
     *      sw, se
     *
     * NOTE: At level one, each quadrant is either (0, 1).
     */

    nw: Node | number;
    ne: Node | number;
    sw: Node | number;
    se: Node | number;

    // Number of active cells in a grid.
    activeCells: number;

    // Current depth of the node in the quadtree.
    depth: number;

    // Identifier for the node-- necessary for hashing by uuid.
    address: string;

    // Resulting node after evolving a node.
    resultCenterNode: any;

    // When iterating the next evolution by stepSize, stop once stepSize reaches the finalStep.
    finalStep: number;

    constructor(
        nw: Node | number,
        ne: Node | number,
        sw: Node | number,
        se: Node | number
    ) {
        this.nw = nw;
        this.ne = ne;
        this.sw = sw;
        this.se = se;

        this.activeCells = 0;
        this.depth = 0;
        this.finalStep = 0;

        this.address = uuidv4();
        this.resultCenterNode = null;

        if (typeof nw === "number" &&
            typeof ne === "number" &&
            typeof sw === "number" &&
            typeof se === "number"
        ) {
            this.activeCells = nw + ne + sw + se;
            this.depth = 1; // 2x2
        }
        else if (
            nw instanceof Node &&
            ne instanceof Node &&
            sw instanceof Node &&
            se instanceof Node
        ) {
            this.activeCells = nw.activeCells + ne.activeCells + sw.activeCells + se.activeCells;
            this.depth = nw.depth + 1;
        }
    }

    static getHash(
        nw: Node | number,
        ne: Node | number,
        sw: Node | number,
        se: Node | number
    ): string {

        const nwi = nw instanceof Node ? nw.address : `${nw}`;
        const nei = ne instanceof Node ? ne.address : `${ne}`;
        const swi = sw instanceof Node ? sw.address : `${sw}`;
        const sei = se instanceof Node ? se.address : `${se}`;

        return nwi + nei + swi + sei;
    }

    static getNode(
        nw: Node | number,
        ne: Node | number,
        sw: Node | number,
        se: Node | number
    ): Node {

        const hash = this.getHash(nw, ne, sw, se);
        if (Cache.cache.has(hash)) return Cache.cache.get(hash);

        const node = new this(nw, ne, sw, se);
        Cache.cache.set(hash, node);

        return node;
    }

    static getBlankNode(depth: number): Node {
        if (depth === 1) return this.getNode(0, 0, 0, 0);

        const childNode = this.getBlankNode(depth - 1);
        return this.getNode(childNode, childNode, childNode, childNode);
    }

    update(isActive: number, numNeighbors: number) {

        const live = 1;
        const dead = 0;

        if (isActive) {
            if (numNeighbors < 2 || numNeighbors > 3) {
                return dead;
            }
            return live;
        }
        else {
            if (numNeighbors === 3) {
                return live;
            }
            return dead;
        }
    }

    /* Evolve a level 2 grid (4x4),
     * Follow this format for variables:
     * [
     *      00, 01, 02, 03
     *      04, mw, me, 08
     *      09, rw, re, 12
     *      13, 14, 15, 16
     * ]
     * When calculating all neighbors, clockwise direction.
     */
    evolveCardinalNode(): Node {

        if (!(
            this.nw instanceof Node &&
            this.ne instanceof Node &&
            this.sw instanceof Node &&
            this.se instanceof Node)
        ) throw new Error("Current node cannot be at depth 1.");

        const _00 = this.nw.nw as number;
        const _01 = this.nw.ne as number;
        const _02 = this.ne.nw as number;
        const _03 = this.ne.ne as number;
        const _04 = this.nw.sw as number;
        const mw = this.nw.se as number;
        const me = this.ne.sw as number;
        const _08 = this.ne.se as number;
        const _09 = this.sw.nw as number;
        const rw = this.sw.ne as number;
        const re = this.se.nw as number;
        const _12 = this.se.ne as number;
        const _13 = this.sw.sw as number;
        const _14 = this.sw.se as number;
        const _15 = this.se.sw as number;
        const _16 = this.se.se as number;

        const mw_neighbors = (_00 + _01 + _02 + _04 + me + _09 + rw + re);
        const me_neighbors = (_01 + _02 + _03 + mw + _08 + rw + re + _12);
        const rw_neighbors = (_04 + mw + me + _09 + re + _13 + _14 + _15);
        const re_neighbors = (mw + me + _08 + rw + _12 + _14 + _15 + _16);

        const centerNode = Node.getNode(
            this.update(mw, mw_neighbors),
            this.update(me, me_neighbors),
            this.update(rw, rw_neighbors),
            this.update(re, re_neighbors)
        );

        return centerNode;
    }

    evolveNode(stepSize: number): Node {

        if (this.finalStep === stepSize && this.resultCenterNode) return this.resultCenterNode;

        if (this.depth < 2) throw new Error("Current node cannot be at depth less than 2.");
        if (!(
            this.nw instanceof Node &&
            this.ne instanceof Node &&
            this.sw instanceof Node &&
            this.se instanceof Node)
        ) throw new Error("Current node cannot be at depth 1.");

        if (this.depth === 2) this.resultCenterNode = this.evolveCardinalNode();
        else if (this.depth === stepSize + 2) {
            const n00 = this.nw.evolveNode(stepSize - 1);
            const n01 = this.nw.horizontalNode(this.ne).evolveNode(stepSize - 1);
            const n02 = this.ne.evolveNode(stepSize - 1);
            const n10 = this.nw.verticalNode(this.sw).evolveNode(stepSize - 1);
            const n11 = this.centerNode().evolveNode(stepSize - 1);
            const n12 = this.ne.verticalNode(this.se).evolveNode(stepSize - 1);
            const n20 = this.sw.evolveNode(stepSize - 1);
            const n21 = this.sw.horizontalNode(this.se).evolveNode(stepSize - 1);
            const n22 = this.se.evolveNode(stepSize - 1);

            this.resultCenterNode = Node.getNode(
                Node.getNode(n00, n01, n10, n11).evolveNode(stepSize - 1),
                Node.getNode(n01, n02, n11, n12).evolveNode(stepSize - 1),
                Node.getNode(n10, n11, n20, n21).evolveNode(stepSize - 1),
                Node.getNode(n11, n12, n21, n22).evolveNode(stepSize - 1)
            );
        }
        else {
            const n00 = this.nw.centerNode();
            const n01 = this.nw.centerHorizontalNode(this.ne);
            const n02 = this.ne.centerNode();
            const n10 = this.nw.centerVerticalNode(this.sw);
            const n11 = this.centerCenterNode();
            const n12 = this.ne.centerVerticalNode(this.se);
            const n20 = this.sw.centerNode();
            const n21 = this.sw.centerHorizontalNode(this.se);
            const n22 = this.se.centerNode();

            this.resultCenterNode = Node.getNode(
                Node.getNode(n00, n01, n10, n11).evolveNode(stepSize),
                Node.getNode(n01, n02, n11, n12).evolveNode(stepSize),
                Node.getNode(n10, n11, n20, n21).evolveNode(stepSize),
                Node.getNode(n11, n12, n21, n22).evolveNode(stepSize)
            );
        }

        this.finalStep = stepSize;
        return this.resultCenterNode;
    }

    /* increaseDepth():
     * To increase the quadtree's depth by one, take the existing root node, and convert to a center node.
     * For example, if we have:
     *
     *      nw, ne
     *      sw, se
     *
     * Then, in our larger grid, we would construct the following:
     *
     *      00, 00, 00, 00
     *      00, nw, ne, 00
     *      00, sw, se, 00
     *      00, 00, 00, 00
     *
     * Where 00 represents a blank node of depth-1.
     */

    increaseDepth(): Node {

        const blankNode = Node.getBlankNode(this.depth - 1);

        // Create each quadrant of the new depth+1 node.

        const newNW = Node.getNode(
            blankNode, blankNode,
            blankNode, this.nw
        );

        const newNE = Node.getNode(
            blankNode, blankNode,
            this.ne, blankNode
        );

        const newSW = Node.getNode(
            blankNode, this.sw,
            blankNode, blankNode
        );

        const newSE = Node.getNode(
            this.se, blankNode,
            blankNode, blankNode
        );

        // Reconstruct a new depth+1 root node.
        const newNode = Node.getNode(
            newNW, newNE,
            newSW, newSE
        );

        return newNode;
    }

    getCell(x: number, y: number): number {

        if (this.depth === 1) {
            if (x < 0 && y < 0) return this.nw as number;
            if (x < 0 && y >= 0) return this.sw as number;
            if (x >= 0 && y < 0) return this.ne as number;
            if (x >= 0 && y >= 0) return this.se as number;
        }

        if (!(
            this.nw instanceof Node &&
            this.ne instanceof Node &&
            this.sw instanceof Node &&
            this.se instanceof Node)
        ) throw new Error("Current node cannot be at depth 1.");

        const quadSize = 2 ** (this.depth - 2);

        if (x < 0 && y < 0) return this.nw.getCell(x + quadSize, y + quadSize);
        if (x < 0 && y >= 0) return this.sw.getCell(x + quadSize, y - quadSize);
        if (x >= 0 && y < 0) return this.ne.getCell(x - quadSize, y + quadSize);
        if (x >= 0 && y >= 0) return this.se.getCell(x - quadSize, y - quadSize);
        else return -1;
    }

    setCell(x: number, y: number, newValue: number): Node {

        if (this.depth === 1) {
            if (x < 0 && y < 0) return Node.getNode(newValue, this.ne, this.sw, this.se);
            if (x < 0 && y >= 0) return Node.getNode(this.nw, this.ne, newValue, this.se);
            if (x >= 0 && y < 0) return Node.getNode(this.nw, newValue, this.sw, this.se);
            if (x >= 0 && y >= 0) return Node.getNode(this.nw, this.ne, this.sw, newValue);
        }

        if (!(
            this.nw instanceof Node &&
            this.ne instanceof Node &&
            this.sw instanceof Node &&
            this.se instanceof Node)
        ) throw new Error("Current node cannot be at depth 1.");

        const quadSize = 2 ** (this.depth - 2);

        if (x < 0 && y < 0) return Node.getNode(this.nw.setCell(x + quadSize, y + quadSize, newValue), this.ne, this.sw, this.se);
        if (x < 0 && y >= 0) return Node.getNode(this.nw, this.ne, this.sw.setCell(x + quadSize, y - quadSize, newValue), this.se);
        if (x >= 0 && y < 0) return Node.getNode(this.nw, this.ne.setCell(x - quadSize, y + quadSize, newValue), this.sw, this.se);
        if (x >= 0 && y >= 0) return Node.getNode(this.nw, this.ne, this.sw, this.se.setCell(x - quadSize, y - quadSize, newValue));

        return Node.getBlankNode(1);
    }

    getList(arr: number[][], x: number, y: number) {
        if (this.activeCells === 0) return;

        if (this.depth === 1) {
            if (this.nw) arr.push([x - 1, y - 1]);
            if (this.ne) arr.push([x, y - 1]);
            if (this.sw) arr.push([x - 1, y]);
            if (this.se) arr.push([x, y]);
        }
        else {

            if (!(
                this.nw instanceof Node &&
                this.ne instanceof Node &&
                this.sw instanceof Node &&
                this.se instanceof Node)
            ) throw new Error("Current node cannot be at depth 1.");

            const quadSize = 2 ** (this.depth - 2);
            this.nw.getList(arr, x - quadSize, y - quadSize);
            this.ne.getList(arr, x + quadSize, y - quadSize);
            this.sw.getList(arr, x - quadSize, y + quadSize);
            this.se.getList(arr, x + quadSize, y + quadSize);
        }
    }

    /* Auxillary (nine) nodes for creating center (depth-1) node. */
    centerNode() {

        if (!(
            this.nw instanceof Node &&
            this.ne instanceof Node &&
            this.sw instanceof Node &&
            this.se instanceof Node)
        ) throw new Error("Current node cannot be at depth 1.");

        return Node.getNode(
            this.nw.se,
            this.ne.sw,
            this.sw.ne,
            this.se.nw
        )
    }

    centerHorizontalNode(east: Node) {

        if (!(
            this.ne instanceof Node &&
            east.nw instanceof Node &&
            this.se instanceof Node &&
            east.sw instanceof Node)
        ) throw new Error("Current node cannot be at depth 1.");

        // Requires two nodes, the west ("this") & the east ("east").
        return Node.getNode(
            this.ne.se,
            east.nw.sw,
            this.se.ne,
            east.sw.nw
        )
    }

    horizontalNode(east: Node) {
        return Node.getNode(
            this.ne,
            east.nw,
            this.se,
            east.sw
        )
    }

    centerVerticalNode(south: Node) {

        if (!(
            this.sw instanceof Node &&
            this.se instanceof Node &&
            south.nw instanceof Node &&
            south.ne instanceof Node)
        ) throw new Error("Current node cannot be at depth 1.");

        // Requires two nodes, the north ("this") & the south ("south").
        return Node.getNode(
            this.sw.se,
            this.se.sw,
            south.nw.ne,
            south.ne.nw
        )
    }

    verticalNode(south: Node) {
        return Node.getNode(
            this.sw,
            this.se,
            south.nw,
            south.ne
        )
    }

    centerCenterNode() {

        if (!(
            this.nw instanceof Node &&
            this.ne instanceof Node &&
            this.sw instanceof Node &&
            this.se instanceof Node)
        ) throw new Error("Current node cannot be at depth 2.");

        if (!(
            this.nw.se instanceof Node &&
            this.ne.sw instanceof Node &&
            this.sw.ne instanceof Node &&
            this.se.nw instanceof Node)
        ) throw new Error("Current node cannot be at depth 1.");

        // Like center node, but one more iteration.
        return Node.getNode(
            this.nw.se.se,
            this.ne.sw.sw,
            this.sw.ne.ne,
            this.se.nw.nw
        )
    }
}

// Class-scoped cache to store seen nodes.
class Cache {
    static cache = new Map();

    has(key: any): boolean { return Cache.cache.has(key); }
    get(key: any): any { return Cache.cache.get(key); }
    set(key: any, value: any): void { Cache.cache.set(key, value); }
    delete(key: any): boolean { return Cache.cache.delete(key); }
    clear(): void { Cache.cache.clear(); }
}

class Universe {

    private initialDepth: number;
    private rootNode: Node;

    constructor() {
        this.initialDepth = 3; // By default, create a 3-level quadtree.
        this.rootNode = Node.getBlankNode(this.initialDepth);
    }

    increaseGridSize(row: number, col: number) {

        const gridMinSize = Math.min(row, col);
        const gridMaxSize = Math.max(row, col);
        let minSize = -(2 ** (this.rootNode.depth - 1));
        let maxSize = 2 ** (this.rootNode.depth - 1);

        while (gridMinSize < minSize || gridMaxSize >= maxSize) {

            this.rootNode = this.rootNode.increaseDepth();

            minSize = -(2 ** (this.rootNode.depth - 1));
            maxSize = 2 ** (this.rootNode.depth - 1);

            // console.log(this.rootNode.depth, `(${minSize}, ${maxSize})`);
        }
    }

    getCell(x: number, y: number) {
        this.increaseGridSize(x, y);
        return this.rootNode.getCell(x, y);
    }

    setCell(x: number, y: number, newValue: number) {
        this.increaseGridSize(x, y);
        this.rootNode = this.rootNode.setCell(x, y, newValue);
    }

    getList() {
        const arr: number[][] = [];
        this.rootNode.getList(arr, 0, 0);
        return arr;
    }

    getActiveCells() {
        return this.rootNode.activeCells;
    }

    evolve(stepSize: number) {

        // NOTE: stepSize is equivalent to 2^(stepSize) iterations (see "quadtree" structure).
        // At minimum, a tree must be at least be a level-3 tree from the stepSize.
        // If the root node has edge cells, increase the depth until empty borders.
        while (
            this.rootNode.depth < stepSize + 2 ||
            this.rootNode.centerCenterNode().activeCells !== this.rootNode.activeCells
        ) {
            this.rootNode = this.rootNode.increaseDepth();
        }

        this.rootNode = this.rootNode.evolveNode(stepSize);
        console.log("Updated!")
    }
}

export { Universe };
