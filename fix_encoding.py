filepath = r"c:\Users\sena\Desktop\zalusa-user\components\auth\auth-page.tsx"

with open(filepath, "rb") as f:
    raw = f.read()

# Remaining broken byte sequences (partially fixed from previous run)
# These are the byte patterns still in the file
byte_replacements = {
    # ş - was triple encoded, one layer removed, now \xc3\x85\xc5\xb8 remains
    b'\xc3\x85\xc5\xb8': 'ş'.encode('utf-8'),   # ş
    # Ş  
    b'\xc3\x85\xc5\xbe': 'Ş'.encode('utf-8'),   # Ş
    # ğ
    b'\xc3\x84\xc5\xb8': 'ğ'.encode('utf-8'),   # possible ğ variant
    # İ
    b'\xc3\x84\xc2\xb0': 'İ'.encode('utf-8'),   # İ
}

# Let me first find all unique non-ASCII byte sequences to understand what's left
# Find sequences that look like broken Turkish chars
import re

# Find all multi-byte sequences  
non_ascii = set()
i = 0
while i < len(raw):
    b = raw[i]
    if b > 127:
        # Grab context
        start = max(0, i-10)
        end = min(len(raw), i+10)
        context = raw[start:end]
        # Find the full sequence
        seq_start = i
        while i < len(raw) and raw[i] > 127:
            i += 1
        seq = raw[seq_start:i]
        non_ascii.add(seq)
        continue
    i += 1

print(f"Found {len(non_ascii)} unique non-ASCII sequences:")
for seq in sorted(non_ascii):
    # Try to decode
    try:
        decoded = seq.decode('utf-8')
        print(f"  {repr(seq)} -> '{decoded}' (valid UTF-8)")
    except:
        print(f"  {repr(seq)} -> INVALID UTF-8")
