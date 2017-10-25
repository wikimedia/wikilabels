DO $$
    BEGIN
        BEGIN
           ALTER TABLE campaign ADD COLUMN info_url VARCHAR(2000);
        EXCEPTION
            WHEN duplicate_column THEN RAISE NOTICE 'column info_url already exists in campaign.';
        END;
    END;
END$$
