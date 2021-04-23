module.exports.MinHeap = class MinHeap {
  #minHeap = null;

  constructor() {
    this.#minHeap = [];
  }

  #parentIndex(index) {
    return (index - 1) / 2;
  }

  #leftIndex(index) {
    return 2 * index + 1;
  }

  #rightIndex(index) {
    return 2 * index + 2;
  }

  #swap(index1, index2) {
    if (!index2) index2 = this.#minHeap.length - 1;

    let temp = this.#minHeap[index1];
    this.#minHeap[index1] = this.#minHeap[index2];
    this.#minHeap[index2] = temp;
  }

  #siftDown(index) {
    let minIndex = index;

    do {
      index = minIndex;

      let l = this.#leftIndex(index);

      if (
        l < this.#minHeap.length &&
        this.#minHeap[l] < this.#minHeap[minIndex]
      )
        minIndex = l;

      let r = this.#rightIndex(index);

      if (
        r < this.#minHeap.length &&
        this.#minHeap[r] < this.#minHeap[minIndex]
      )
        minIndex = r;

      if (index !== minIndex) this.#swap(index, minIndex);
    } while (index !== minIndex);
  }

  #siftUp(index) {
    let minIndex = index;

    do {
      index = minIndex;
      let p = this.#parentIndex(index);

      if (this.#minHeap[p] > this.#minHeap[index]) {
        this.#swap(p, index);
        minIndex = p;
      }
    } while (minIndex !== index);
  }


  size(){
    return this.#minHeap.length;
  }

  getMin() {
    return this.#minHeap[0];
  }

  push(sessionData) {
    this.#minHeap.push(sessionData);
    let index = this.#minHeap.length - 1;
    sessionData.index = index;
    this.#siftUp(index);
  }

  pop() {
    this.#swap(0);
    let sessionData = this.#minHeap.pop();
    this.#siftDown(0);
    return sessionData;
  }

  remove(index) {
    if(index >= this.#minHeap.length)
    return;
    
    this.#swap(index);
    let sessionData = this.#minHeap.pop();
    this.#siftDown(0);
    return sessionData;
  }
};
