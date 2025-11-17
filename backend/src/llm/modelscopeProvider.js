'use strict';

const axios = require('axios');
const LLMProvider = require('./LLMProvider');

class ModelScopeProvider extends LLMProvider {
  constructor(config = {}) {
    super(config);
    const {
      apiUrl = process.env.MODEL_API_URL,
      apiKey = process.env.MODEL_API_KEY,
      modelId = process.env.MODEL_MODEL_ID,
      timeout = 2000,
    } = config;
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
    this.modelId = modelId;
    this.timeout = timeout;
    this.client = axios.create({
      baseURL: this.apiUrl,
      timeout: this.timeout,
      headers: {
        Authorization: this.apiKey ? `Bearer ${this.apiKey}` : undefined,
        'Content-Type': 'application/json',
      },
    });
  }

  async infer(prompt, options = {}) {
    try {
      const url = options.path || '/chat/completions';
      const payload = options.payload || {
        model: this.modelId,
        messages: [{ role: 'user', content: String(prompt) }],
      };
      const res = await this.client.post(url, payload);
      const data = res.data;
      if (!data) return null;
      if (data.choices && data.choices.length > 0) {
        const c = data.choices[0];
        if (c.message && c.message.content) return c.message.content;
        if (c.text) return c.text;
      }
      if (typeof data === 'string') return data;
      if (data.output) return data.output;
      if (data.result) return data.result;
      if (data.text) return data.text;
      return JSON.stringify(data);
    } catch (_) {
      return null;
    }
  }
}

module.exports = ModelScopeProvider;