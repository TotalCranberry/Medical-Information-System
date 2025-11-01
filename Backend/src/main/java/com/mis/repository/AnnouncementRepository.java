package com.mis.repository;

import com.mis.model.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    List<Announcement> findByTargetRoleOrTargetRole(Announcement.TargetRole role1, Announcement.TargetRole role2);
}