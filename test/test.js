"use strict";

const assert = require("assert");
const path = require("path");
const fs = require("fs");
const Gameboy = require("node-gameboy");

function runTest(rompath, { cycles }, cb) {
  const gameboy = new Gameboy();

  gameboy.loadCart(fs.readFileSync(rompath));
  gameboy._init();

  for (let i = 0; i < cycles; i++) {
    gameboy._cpu._runCycle();
  }

  const memory = new Uint8Array(65536);
  for (let offset = 0; offset <= 0xffff; offset++) {
    memory[offset] = gameboy._mmu.readByte(offset);
  }

  cb(gameboy, memory);
}

function depth(gameboy) {
  return (((0xed - gameboy._cpu.c) / 2) | 0) + 1;
}

function stack(gameboy) {
  const c = gameboy._cpu.c;
  const stack = [];
  for (let i = c; i < 0xed; i += 2) {
    stack.push(gameboy._mmu.readWord(0xff00 + i));
  }
  stack.push(gameboy._cpu.hl);
  return stack.reverse();
}

runTest(
  path.resolve(__dirname, "./test-asm-add.gb"),
  { cycles: 200 },
  gameboy => {
    assert.equal(gameboy._cpu.a, 0x33);
    assert.equal(gameboy._cpu.d, 0x33);
    assert.equal(gameboy._cpu.e, 0x33);
  }
);

runTest(
  path.resolve(__dirname, "./test-asm-sub.gb"),
  { cycles: 200 },
  gameboy => {
    assert.equal(gameboy._cpu.a, 0x11);
    assert.equal(gameboy._cpu.d, 0x11);
    assert.equal(gameboy._cpu.e, 0x11);
  }
);

runTest(path.resolve(__dirname, "./test-dup.gb"), { cycles: 200 }, gameboy => {
  assert.deepStrictEqual(stack(gameboy), [0x22, 0x11, 0x22]);
});

runTest(path.resolve(__dirname, "./test-swap.gb"), { cycles: 200 }, gameboy => {
  assert.deepStrictEqual(stack(gameboy), [0x22, 0x11, 0x33]);
});

runTest(path.resolve(__dirname, "./test-drop.gb"), { cycles: 200 }, gameboy => {
  assert.deepStrictEqual(stack(gameboy), [0x11]);
});

runTest(
  path.resolve(__dirname, "./test-memget.gb"),
  { cycles: 200 },
  (gameboy, memory) => {
    assert.deepStrictEqual(stack(gameboy), [0x66, 0xce, 0xed]);
  }
);

runTest(
  path.resolve(__dirname, "./test-memset.gb"),
  { cycles: 200 },
  (gameboy, memory) => {
    assert(depth(gameboy) === 0);
    assert(memory[0x8501] === 0xce);
    assert(memory[0x8502] === 0xed);
    assert(memory[0x8503] === 0x66);
  }
);

runTest(
  path.resolve(__dirname, "./test-plus.gb"),
  { cycles: 200 },
  (gameboy, memory) => {
    assert.deepStrictEqual(stack(gameboy), [0x33]);
  }
);

runTest(
  path.resolve(__dirname, "./test-double.gb"),
  { cycles: 200 },
  (gameboy, memory) => {
    assert.deepStrictEqual(stack(gameboy), [0x44]);
  }
);

runTest(
  path.resolve(__dirname, "./test-colon-shadow.gb"),
  { cycles: 200 },
  (gameboy, memory) => {
    assert.deepStrictEqual(stack(gameboy), [11]);
  }
);
