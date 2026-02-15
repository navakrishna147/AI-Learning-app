' ============================================================================
' AUTO-START BACKEND - Windows VBS Script
' ============================================================================
'
' This VBS script starts the backend server hidden (without command window)
' and can be scheduled to run automatically on system startup.
'
' Setup Instructions:
' 1. Place this file in: C:\Users\<YourUsername>\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup\
'    OR
'    Use Windows Task Scheduler to run this at startup
'
' 2. To use with Task Scheduler:
'    a. Open Task Scheduler (Win + R, type "taskschd.msc")
'    b. Create Basic Task > Name: "Start Backend Server"
'    c. Trigger: At startup
'    d. Action: Start a program
'    e. Program: C:\Windows\System32\wscript.exe
'    f. Arguments: "C:\full\path\to\start-backend-autostart.vbs"
'    g. Configure with highest privileges
'    h. Run only when user is logged in
'
' 3. Alternative - Direct execution:
'    - Change the paths below to match your installation
'    - Right-click > Properties to set execution policy if needed
'
' ============================================================================

Option Explicit

Dim objShell, objFSO, strBackendPath, strBatFile, strLogFile, strCommand
Dim objWshScriptExec, objLogFile, strTimestamp

' Create shell and file system objects
Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

' CONFIGURE THESE PATHS - Change based on your installation
' Example: C:\Projects\LMS\MERNAI\ai-learning-assistant\backend\
strBackendPath = "D:\LMS-Full Stock Project\LMS\MERNAI\ai-learning-assistant\backend\"
strBatFile = strBackendPath & "start-backend.bat"
strLogFile = strBackendPath & "logs\autostart.log"

' Create logs directory if it doesn't exist
Dim logsFolder
Set logsFolder = objFSO.GetFolder(strBackendPath)
If Not objFSO.FolderExists(logsFolder.Path & "\logs") Then
    objFSO.CreateFolder logsFolder.Path & "\logs"
End If

' Get current timestamp for logging
strTimestamp = Now()

' Log startup attempt
LogMessage "=========================================="
LogMessage "Backend Autostart Script Executed"
LogMessage "Timestamp: " & strTimestamp
LogMessage "Backend Path: " & strBackendPath
LogMessage "Batch File: " & strBatFile
LogMessage "=========================================="

' Check if batch file exists
If Not objFSO.FileExists(strBatFile) Then
    LogMessage "ERROR: Batch file not found at: " & strBatFile
    LogMessage "Please update the strBatFile path in this script"
    WScript.Quit 1
End If

' Check if backend directory exists
If Not objFSO.FolderExists(strBackendPath) Then
    LogMessage "ERROR: Backend directory not found at: " & strBackendPath
    LogMessage "Please update the strBackendPath in this script"
    WScript.Quit 1
End If

LogMessage "✓ Batch file found"
LogMessage "✓ Backend directory found"

' Wait 3 seconds for system to stabilize
LogMessage "Waiting 3 seconds for system to stabilize..."
WScript.Sleep 3000

' Run the batch file without showing command window
strCommand = strBatFile

LogMessage "Starting backend with command: " & strCommand

' Execute the command (minimized/hidden)
On Error Resume Next
objShell.Run strCommand, 0, False  ' 0 = hidden window, False = non-blocking
If Err.Number <> 0 Then
    LogMessage "ERROR: Failed to start backend. Error: " & Err.Description
    WScript.Quit 1
Else
    LogMessage "✓ Successfully started backend server"
    LogMessage "Server should be available at: http://localhost:5000"
    LogMessage "Health check: http://localhost:5000/api/health"
End If
On Error GoTo 0

LogMessage "Script execution complete"
LogMessage ""

' Subroutine to log messages
Sub LogMessage(message)
    On Error Resume Next
    
    ' Append to log file
    Set objLogFile = objFSO.OpenTextFile(strLogFile, 8, True)  ' 8 = ForAppending
    objLogFile.WriteLine strTimestamp & " - " & message
    objLogFile.Close
    
    On Error GoTo 0
End Sub

' Cleanup
Set objShell = Nothing
Set objFSO = Nothing
Set objLogFile = Nothing
Set logsFolder = Nothing

WScript.Quit 0
