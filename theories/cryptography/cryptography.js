/**
 * Cryptography - Interactive Demos
 * Caesar cipher, public key encryption, and hash functions
 */

(function() {
  'use strict';

  // ============================================
  // Caesar Cipher Demo
  // ============================================
  const CaesarCipher = {
    plaintext: null,
    shiftSlider: null,
    shiftValue: null,
    cipherAlphabet: null,
    ciphertextOutput: null,

    init() {
      this.plaintext = document.getElementById('caesar-plaintext');
      this.shiftSlider = document.getElementById('caesar-shift');
      this.shiftValue = document.querySelector('.shift-value');
      this.cipherAlphabet = document.querySelector('.cipher-alphabet');
      this.ciphertextOutput = document.querySelector('.caesar-ciphertext');

      if (!this.plaintext || !this.shiftSlider) return;

      this.bindEvents();
      this.update();
    },

    bindEvents() {
      this.plaintext.addEventListener('input', () => this.update());
      this.shiftSlider.addEventListener('input', () => this.update());
    },

    encrypt(text, shift) {
      return text.toUpperCase().split('').map(char => {
        if (char >= 'A' && char <= 'Z') {
          const code = ((char.charCodeAt(0) - 65 + shift) % 26) + 65;
          return String.fromCharCode(code);
        }
        return char;
      }).join('');
    },

    getShiftedAlphabet(shift) {
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      return alphabet.split('').map((_, i) => {
        return alphabet[(i + shift) % 26];
      });
    },

    update() {
      const shift = parseInt(this.shiftSlider.value);
      const text = this.plaintext.value;

      // Update shift display
      this.shiftValue.textContent = shift;

      // Update cipher alphabet
      const shiftedAlphabet = this.getShiftedAlphabet(shift);
      this.cipherAlphabet.innerHTML = shiftedAlphabet
        .map(letter => `<span>${letter}</span>`)
        .join('');

      // Update ciphertext
      this.ciphertextOutput.textContent = this.encrypt(text, shift);
    }
  };

  // ============================================
  // Public Key Encryption Demo
  // ============================================
  const PublicKeyDemo = {
    // Using small primes for educational demo
    // In real RSA, these would be hundreds of digits
    p: 31,
    q: 37,
    n: null,      // p * q (public)
    e: 7,         // public exponent
    d: null,      // private exponent

    messageInput: null,
    encryptBtn: null,
    resultSection: null,
    originalValue: null,
    encryptedValue: null,
    decryptedValue: null,
    alicePublic: null,
    alicePrivate: null,

    init() {
      this.messageInput = document.getElementById('pubkey-message');
      this.encryptBtn = document.querySelector('.encrypt-btn');
      this.resultSection = document.querySelector('.demo-result');
      this.originalValue = document.querySelector('.original-value');
      this.encryptedValue = document.querySelector('.encrypted-value');
      this.decryptedValue = document.querySelector('.decrypted-value');
      this.alicePublic = document.querySelector('.alice-public');
      this.alicePrivate = document.querySelector('.alice-private');

      if (!this.encryptBtn) return;

      this.generateKeys();
      this.bindEvents();
    },

    generateKeys() {
      // n = p * q
      this.n = this.p * this.q; // 1147

      // Calculate totient: (p-1) * (q-1)
      const totient = (this.p - 1) * (this.q - 1); // 1080

      // Find d such that (d * e) mod totient = 1
      // For e=7 and totient=1080, d=463 works
      this.d = this.modInverse(this.e, totient);

      // Update display
      if (this.alicePublic) this.alicePublic.textContent = this.n;
      if (this.alicePrivate) this.alicePrivate.textContent = this.d;
    },

    // Extended Euclidean Algorithm for modular inverse
    modInverse(a, m) {
      let [old_r, r] = [a, m];
      let [old_s, s] = [1, 0];

      while (r !== 0) {
        const quotient = Math.floor(old_r / r);
        [old_r, r] = [r, old_r - quotient * r];
        [old_s, s] = [s, old_s - quotient * s];
      }

      return old_s < 0 ? old_s + m : old_s;
    },

    // Modular exponentiation (handles large numbers)
    modPow(base, exp, mod) {
      let result = 1;
      base = base % mod;
      while (exp > 0) {
        if (exp % 2 === 1) {
          result = (result * base) % mod;
        }
        exp = Math.floor(exp / 2);
        base = (base * base) % mod;
      }
      return result;
    },

    encrypt(m) {
      // c = m^e mod n
      return this.modPow(m, this.e, this.n);
    },

    decrypt(c) {
      // m = c^d mod n
      return this.modPow(c, this.d, this.n);
    },

    bindEvents() {
      this.encryptBtn.addEventListener('click', () => this.runDemo());
      this.messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.runDemo();
      });
    },

    runDemo() {
      const message = parseInt(this.messageInput.value);

      if (isNaN(message) || message < 0 || message >= this.n) {
        alert(`Please enter a number between 0 and ${this.n - 1}`);
        return;
      }

      const encrypted = this.encrypt(message);
      const decrypted = this.decrypt(encrypted);

      this.originalValue.textContent = message;
      this.encryptedValue.textContent = encrypted;
      this.decryptedValue.textContent = decrypted;

      this.resultSection.style.display = 'grid';

      // Add animation
      this.resultSection.style.animation = 'none';
      this.resultSection.offsetHeight; // Trigger reflow
      this.resultSection.style.animation = 'fadeIn 0.3s ease';
    }
  };

  // ============================================
  // Hash Function Demo
  // ============================================
  const HashDemo = {
    hashInput: null,
    hashOutput: null,
    comparison1: null,
    comparison2: null,

    init() {
      this.hashInput = document.getElementById('hash-input');
      this.hashOutput = document.querySelector('.hash-value');
      this.comparison1 = document.querySelectorAll('.hash-result')[0];
      this.comparison2 = document.querySelectorAll('.hash-result')[1];

      if (!this.hashInput) return;

      this.bindEvents();
      this.update();
      this.updateComparison();
    },

    bindEvents() {
      this.hashInput.addEventListener('input', () => this.update());
    },

    // Simple hash function for demonstration
    // NOT cryptographically secure - just for educational purposes
    simpleHash(str) {
      let hash = 0;
      const prime1 = 31;
      const prime2 = 486187739;

      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash * prime1) + char) % prime2;
      }

      // Convert to hex-like string (simulating SHA-256 output)
      const hex = Math.abs(hash).toString(16).padStart(8, '0');

      // Generate more "random-looking" output by hashing again with variations
      let fullHash = '';
      for (let i = 0; i < 8; i++) {
        let subHash = hash;
        for (let j = 0; j < str.length; j++) {
          subHash = ((subHash * (prime1 + i)) + str.charCodeAt(j) + i * 17) % prime2;
        }
        fullHash += Math.abs(subHash).toString(16).padStart(8, '0');
      }

      return fullHash.substring(0, 64);
    },

    // More realistic-looking hash that changes dramatically with small input changes
    deterministicHash(str) {
      // Use multiple rounds to create avalanche effect
      let state = [
        0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
        0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
      ];

      // Process each character
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        const idx = i % 8;

        // Mix the character into the state
        state[idx] = (state[idx] + char * 0x100) >>> 0;
        state[(idx + 1) % 8] ^= (state[idx] << 5) | (state[idx] >>> 27);
        state[(idx + 2) % 8] += state[idx] >>> 11;

        // Additional mixing rounds
        for (let j = 0; j < 8; j++) {
          state[j] = (state[j] ^ (state[(j + 1) % 8] >>> 3)) >>> 0;
          state[j] = (state[j] + (state[(j + 7) % 8] << 7)) >>> 0;
        }
      }

      // Final mixing
      for (let round = 0; round < 4; round++) {
        for (let j = 0; j < 8; j++) {
          state[j] = (state[j] ^ (state[(j + 3) % 8] >>> 5)) >>> 0;
          state[j] = (state[j] * 0x85ebca6b) >>> 0;
        }
      }

      // Convert to hex string
      return state.map(n => (n >>> 0).toString(16).padStart(8, '0')).join('');
    },

    update() {
      const input = this.hashInput.value;
      const hash = this.deterministicHash(input);

      // Show truncated version with ellipsis
      this.hashOutput.textContent = hash.substring(0, 16) + '...';
    },

    updateComparison() {
      const hash1 = this.deterministicHash('Hello, World!');
      const hash2 = this.deterministicHash('Hello, World?');

      if (this.comparison1) {
        this.comparison1.textContent = hash1.substring(0, 16) + '...';
      }
      if (this.comparison2) {
        this.comparison2.textContent = hash2.substring(0, 16) + '...';
      }
    }
  };

  // ============================================
  // Initialize all demos
  // ============================================
  function init() {
    CaesarCipher.init();
    PublicKeyDemo.init();
    HashDemo.init();
  }

  // Add CSS animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for debugging
  window.TIP = window.TIP || {};
  window.TIP.Cryptography = {
    CaesarCipher,
    PublicKeyDemo,
    HashDemo
  };
})();
