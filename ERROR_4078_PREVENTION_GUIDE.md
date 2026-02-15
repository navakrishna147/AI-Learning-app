# Error -4078 Quick Reference & Prevention Guide

## 🎯 Quick Fix Checklist

- [x] Uploads directory is created at server startup
- [x] Static file middleware has error handling
- [x] File paths are properly resolved (absolute paths)
- [x] File cleanup operations handle both relative and absolute paths
- [x] All file operations have try-catch blocks
- [x] Console logging shows status of file operations

---

## 🔴 How to Detect Error -4078

### **Console Output:**
```
❌ Error creating uploads directory: Error...
❌ ENOENT: no such file or directory
```

### **Frontend Error:**
```
Network error while uploading file
Failed to load document
404 Not Found
```

---

## ✅ Prevention Checklist for New File Operations

Before adding any file operation to the code:

- [ ] Does the directory exist before attempting file access?
- [ ] Are you using absolute paths with `path.join(__dirname, ...)`?
- [ ] Do you have a try-catch block around file operations?
- [ ] Are you logging what happens (success or error)?
- [ ] Does the error handler provide useful information?
- [ ] Can the operation fail gracefully without crashing?

---

## 🛠️ Common File Operations Pattern

### **✅ Correct Pattern:**

```javascript
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create directory
const targetDir = path.join(__dirname, 'target-directory');
try {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    console.log('✅ Directory created:', targetDir);
  }
} catch (error) {
  console.error('❌ Error creating directory:', error.message);
}

// Delete file
try {
  const filePath = path.join(__dirname, 'relative/path/file.txt');
  if (fs.existsSync(filePath)) {
    await fs.promises.unlink(filePath);
    console.log('✅ File deleted:', filePath);
  } else {
    console.warn('⚠️ File not found:', filePath);
  }
} catch (error) {
  console.error('⚠️ Error deleting file:', error.message);
}
```

---

## ❌ What NOT to Do

### **Problem #1: Using relative paths without resolution**
```javascript
// ❌ WRONG
fs.existsSync('uploads/file.pdf');  // May fail depending on cwd

// ✅ CORRECT
fs.existsSync(path.join(__dirname, '../uploads/file.pdf'));
```

### **Problem #2: No error handling**
```javascript
// ❌ WRONG
app.use('/uploads', express.static('uploads'));  // Crashes if dir missing

// ✅ CORRECT
app.use('/uploads', express.static(uploadsDir, { onError: handleError }));
```

### **Problem #3: Not checking directory exists**
```javascript
// ❌ WRONG
fs.writeFileSync(path.join(dir, file));  // dir may not exist

// ✅ CORRECT
fs.mkdirSync(dir, { recursive: true });  // Create if missing
fs.writeFileSync(path.join(dir, file));
```

---

## 📚 Key Functions Reference

### **Directory Operations:**
```javascript
// Check if exists
fs.existsSync(path)

// Create with recursive option
fs.mkdirSync(path, { recursive: true })

// Create async
await fs.promises.mkdir(path, { recursive: true })

// List contents
fs.readdirSync(path)
```

### **File Operations:**
```javascript
// Delete file
fs.unlinkSync(path)
await fs.promises.unlink(path)

// Check if exists
fs.existsSync(path)

// Read content
fs.readFileSync(path)
await fs.promises.readFile(path)

// Write content
fs.writeFileSync(path, content)
await fs.promises.writeFile(path, content)
```

### **Path Operations:**
```javascript
// Resolve to absolute path
path.resolve(relativePath)
path.join(__dirname, relativePath)

// Get directory name
path.dirname(filePath)

// Get file name
path.basename(filePath)

// Check if absolute
path.isAbsolute(filePath)
```

---

## 🔍 Debugging Tips

### **When Error -4078 Occurs:**

1. **Check the exact error message:**
   ```bash
   Look for: "ENOENT: no such file or directory"
   Path shown: Check what path is being accessed
   ```

2. **Verify directory exists:**
   ```javascript
   // In console
   console.log('Directory exists:', fs.existsSync('./uploads'));
   ```

3. **Check permissions:**
   ```bash
   # Windows - Check file properties
   # Linux - Use: ls -la directory/
   ```

4. **Log the full path being accessed:**
   ```javascript
   // Always log absolute paths
   console.log('Full path:', path.resolve(targetPath));
   ```

---

## 📝 Code Review Checklist

When reviewing file operation code:

- [ ] All paths are absolute (using `path.join(__dirname, ...)`)
- [ ] Directories are created before writing files
- [ ] All file operations have error handling
- [ ] Errors are logged with context
- [ ] Operations fail gracefully (don't crash server)
- [ ] Tests cover both success and failure cases
- [ ] Documentation explains expected behavior

---

## 🚀 Best Practices for File Operations

### **1. Always use absolute paths:**
```javascript
// Good
const filePath = path.join(__dirname, '../uploads', filename);

// Bad
const filePath = 'uploads/' + filename;
```

### **2. Check existence before operations:**
```javascript
// Good
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Bad
fs.mkdirSync(dir);  // Crashes if exists or permission denied
```

### **3. Use async/await for I/O operations:**
```javascript
// Good
await fs.promises.unlink(filePath);

// Acceptable (in middleware)
fs.unlinkSync(filePath);
```

### **4. Always wrap in try-catch:**
```javascript
// Good
try {
  await fs.promises.unlink(filePath);
  console.log('✅ File deleted');
} catch (error) {
  console.error('⚠️ Error deleting file:', error.message);
}
```

---

## 📞 Need Help?

See the main document: `ERROR_4078_FIX.md`

**Key Points:**
- Error -4078 = ENOENT (file/directory not found)
- Check server logs for "❌ Error" messages
- Verify `backend/uploads/` directory exists
- Ensure proper path resolution in all file operations

---

**Version:** 1.0  
**Updated:** February 11, 2026  
**Status:** Ready for Production
