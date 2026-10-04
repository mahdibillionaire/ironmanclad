/**
 * Utility functions to sanitize and mask PII (Emails, Phones, Names, Domains, URLs, Payloads)
 * in public logs for CI/CD environments (e.g. GitHub Actions).
 */

export function maskEmail(email: string | null | undefined): string {
    if (!email || typeof email !== 'string' || email === 'N/A' || email === 'NONE') return email || 'N/A';
    const trimmed = email.trim();
    if (!trimmed.includes('@')) {
        if (trimmed.length <= 3) return '***';
        return trimmed.slice(0, 2) + '***';
    }
    const [user, domain] = trimmed.split('@');
    const maskedUser = user.length <= 2 ? user[0] + '***' : user[0] + '***' + user.slice(-1);
    
    if (!domain) return `${maskedUser}@***`;
    const parts = domain.split('.');
    if (parts.length >= 2) {
        const name = parts[0];
        const ext = parts.slice(1).join('.');
        const maskedName = name.length <= 2 ? name[0] + '***' : name[0] + '***' + name.slice(-1);
        return `${maskedUser}@${maskedName}.${ext}`;
    }
    return `${maskedUser}@${domain.slice(0, 1)}***`;
}

export function maskPhone(phone: string | null | undefined): string {
    if (!phone || typeof phone !== 'string' || phone === 'N/A' || phone === 'NONE') return phone || 'N/A';
    const trimmed = phone.trim();
    const digits = trimmed.replace(/\D/g, '');
    if (digits.length < 7) return '***-****';
    
    const prefix = trimmed.startsWith('+') ? '+' : '';
    if (digits.length >= 10) {
        const country = digits.length > 10 ? digits.slice(0, digits.length - 10) : '';
        const area = digits.slice(digits.length - 10, digits.length - 7);
        const last4 = digits.slice(-4);
        return `${prefix}${country ? country + ' ' : ''}(${area}) ***-${last4}`;
    }
    return `${prefix}${digits.slice(0, 3)}***${digits.slice(-2)}`;
}

export function maskName(name: string | null | undefined): string {
    if (!name || typeof name !== 'string' || name === 'N/A' || name === 'Unknown' || name === 'Results') return name || 'N/A';
    const trimmed = name.trim();
    if (!trimmed) return 'N/A';
    
    const words = trimmed.split(/\s+/);
    return words.map(w => {
        if (w.length <= 2) return w[0] + '*';
        return w[0] + '***' + (w.length > 3 ? w.slice(-1) : '');
    }).join(' ');
}

export function maskDomain(domain: string | null | undefined): string {
    if (!domain || typeof domain !== 'string' || domain === 'N/A') return domain || 'N/A';
    const trimmed = domain.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0].toLowerCase().trim();
    const parts = trimmed.split('.');
    if (parts.length >= 2) {
        const name = parts[0];
        const ext = parts.slice(1).join('.');
        const maskedName = name.length <= 2 ? name[0] + '***' : name[0] + '***' + name.slice(-1);
        return `${maskedName}.${ext}`;
    }
    return trimmed.length <= 2 ? '***' : trimmed[0] + '***';
}

export function maskUrl(urlStr: string | null | undefined): string {
    if (!urlStr || typeof urlStr !== 'string' || urlStr === 'N/A') return urlStr || 'N/A';
    try {
        const parsed = new URL(urlStr.startsWith('http') ? urlStr : `https://${urlStr}`);
        const maskedDom = maskDomain(parsed.hostname);
        let path = parsed.pathname;
        if (path.length > 35) {
            path = path.slice(0, 20) + '...' + path.slice(-10);
        }
        return `${parsed.protocol}//${maskedDom}${path}`;
    } catch {
        return maskDomain(urlStr);
    }
}

export function maskPayload(val: string | null | undefined): string {
    if (!val || typeof val !== 'string') return '';
    const trimmed = val.trim();
    // Check if email
    if (trimmed.includes('@') && trimmed.includes('.')) {
        return maskEmail(trimmed);
    }
    // Check if phone
    const digits = trimmed.replace(/\D/g, '');
    if (digits.length >= 7 && digits.length <= 15 && /^[\d\+\-\(\)\s\.]+$/.test(trimmed)) {
        return maskPhone(trimmed);
    }
    // Check if large pitch message
    if (trimmed.length > 30) {
        return `[Redacted Pitch Payload: ${trimmed.length} chars]`;
    }
    // Short name or input text
    return maskName(trimmed);
}
