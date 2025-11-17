'use strict';

class LLMProvider {
  constructor(config = {}) {
    this.config = config;
  }

  async infer(prompt, _options = {}) {
    throw new Error('Not implemented');
  }
}

module.exports = LLMProvider;