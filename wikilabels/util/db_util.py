

def run_query(db, query):
    with db.transaction() as transactor:
        cursor = transactor.cursor()
        cursor.execute(query)
        for row in cursor:
            return row
