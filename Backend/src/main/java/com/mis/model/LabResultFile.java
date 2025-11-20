package com.mis.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "lab_result_files")
public class LabResultFile {

    @Id
    private String id;

    @ManyToOne
    @JoinColumn(name = "result_id")
    private LabResult result;

    private String fileName;

    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] fileData;

    private LocalDateTime uploadedAt;

    // ---- GETTERS & SETTERS -----

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public LabResult getResult() {
        return result;
    }

    public void setResult(LabResult result) {
        this.result = result;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public byte[] getFileData() {
        return fileData;
    }

    public void setFileData(byte[] fileData) {
        this.fileData = fileData;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }
}


