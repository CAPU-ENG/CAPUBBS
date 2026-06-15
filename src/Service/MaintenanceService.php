<?php

class CapubbsMaintenanceService {
    const INVALID_XML_CODEPOINTS = array(
        0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08,
        0x0B, 0x0C,
        0x0E, 0x0F, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16,
        0x17, 0x18, 0x19, 0x1A, 0x1B, 0x1C, 0x1D, 0x1E, 0x1F,
    );

    private $maintenanceRepository;

    public function __construct($maintenanceRepository) {
        $this->maintenanceRepository = $maintenanceRepository;
    }

    public function analyzeDirtyPosts($filters) {
        $rowCount = $this->maintenanceRepository->countPostsByFilters($filters);
        $resultsAll = array();
        $errors = array();

        foreach (self::INVALID_XML_CODEPOINTS as $codepoint) {
            $rows = $this->maintenanceRepository->findDirtyPostRowsByByte($filters, $codepoint);
            if ($rows === false) {
                $errors[] = array(
                    'codepoint' => $codepoint,
                    'error' => $this->maintenanceRepository->lastError(),
                );
                continue;
            }

            foreach ($rows as $row) {
                $fid = intval($row['fid']);
                if (!isset($resultsAll[$fid])) {
                    $resultsAll[$fid] = array(
                        'row' => $row,
                        'chars' => array(),
                    );
                }
                $resultsAll[$fid]['chars'][] = $codepoint;
            }
        }

        foreach ($resultsAll as $fid => $info) {
            $resultsAll[$fid]['chars'] = array_values(array_unique($info['chars']));
        }

        return array(
            'rowCount' => $rowCount,
            'matches' => $resultsAll,
            'errors' => $errors,
        );
    }
}
