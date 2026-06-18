package com.eden.api.repository;

import com.eden.api.entity.SearchRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SearchRecordRepository extends JpaRepository<SearchRecord, Long> {
    List<SearchRecord> findTop5ByOrderByCreatedAtDesc();
}
