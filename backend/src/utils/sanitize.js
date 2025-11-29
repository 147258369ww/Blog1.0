function sanitizeHtml(input) {
  if (typeof input !== 'string') return input;
  let out = input;
  out = out.replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, '');
  out = out.replace(/<\s*iframe[^>]*>[\s\S]*?<\s*\/\s*iframe\s*>/gi, '');
  out = out.replace(/<\s*object[^>]*>[\s\S]*?<\s*\/\s*object\s*>/gi, '');
  out = out.replace(/<\s*embed[^>]*>[\s\S]*?<\s*\/\s*embed\s*>/gi, '');
  out = out.replace(/on[a-z]+\s*=\s*"[^"]*"/gi, '');
  out = out.replace(/on[a-z]+\s*=\s*'[^']*'/gi, '');
  out = out.replace(/(href|src)\s*=\s*"\s*javascript:[^"]*"/gi, '$1="#"');
  out = out.replace(/(href|src)\s*=\s*'\s*javascript:[^']*'/gi, "$1='#'");
  return out;
}

function sanitizeText(input) {
  if (typeof input !== 'string') return input;
  return input.replace(/[\u0000-\u001F\u007F]/g, '').trim();
}

module.exports = {
  sanitizeHtml,
  sanitizeText,
};

