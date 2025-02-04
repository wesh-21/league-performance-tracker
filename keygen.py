import secrets
import string

# Generate a random 32-character key
key = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(32))

print(key)
