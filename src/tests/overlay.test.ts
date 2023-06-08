
import { describe, expect, test } from '@jest/globals';
import { Node, Distance } from '../lib/overlay';

describe('Node', () => {
  test('parse ID', () => {
    const node = Node.parse('FC_d7vkj3XKCF8JNpt3MMacwhcMfz75tJHEF2Zou4m4pih');
    expect(node.isValid()).toBe(true);
  });

  test('parse invalid ID', () => {
    expect(() => Node.parse('FC_ABCD')).toThrow(Error);
  });

  test('equals', () => {
    const node1 = Node.parse('FC_d7vkj3XKCF8JNpt3MMacwhcMfz75tJHEF2Zou4m4pih');
    const node2 = Node.parse('FC_d7vkj3XKCF8JNpt3MMacwhcMfz75tJHEF2Zou4m4pih');

    expect(node1.equals(node2)).toBe(true);
    expect(node1.equals('FC_d7vkj3XKCF8JNpt3MMacwhcMfz75tJHEF2Zou4m4pih')).toBe(true);
  });
});

describe('Distance', () => {
  test('to string', () => {
    const node1 = new Node('FC_7iqZKQZ45E9kb8fviqo8iP9Hex7qj35qmHMa6okkB1dG');
    const node2 = new Node('FC_7iqZKQZ45E9kb8fviqo8iP9Hex7qj35qmHMa6okkB1dF');

    const distance = new Distance(node1, node2);

    expect(distance.toString()).toBe('Distance(1)');
  });

  test('type is object', () => {
    const node1 = new Node('FC_7iqZKQZ45E9kb8fviqo8iP9Hex7qj35qmHMa6okkB1dG');
    const node2 = new Node('FC_7iqZKQZ45E9kb8fviqo8iP9Hex7qj35qmHMa6okkB1dF');

    const distance = new Distance(node1, node2);

    expect(typeof distance).toBe('object');
  });

  test('equals', () => {
    const node1 = new Node('FC_7iqZKQZ45E9kb8fviqo8iP9Hex7qj35qmHMa6okkB1dG');
    const node2 = new Node('FC_7iqZKQZ45E9kb8fviqo8iP9Hex7qj35qmHMa6okkB1dF');
    const node3 = new Node('FC_6iqZKQZ45E9kb8fviqo8iP9Hex7qj35qmHMa6okkB1dF');

    const distance1 = new Distance(node1, node2);
    const distance2 = new Distance(node2, node3);

    expect(distance1.equals(123)).toBe(false);
    expect(distance1.equals(distance2)).toBe(false);
  });
});
