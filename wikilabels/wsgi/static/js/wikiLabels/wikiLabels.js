(function($){
	if (window.wikiLabels) {
		throw "wikiLabels is already defined!  Exiting.";
	}
	window.wikiLabels = {
		config: {
			serverRoot: "//ores.wmflabs.org/labels",
			prefix: "wikilabels-",
			messages: {
				en: {
					'date-format': "%Y-%m-%d",
					'Review': 'Review',
					'Workset': 'Workset',
					'Save': 'Save',
					'request workset': 'request workset',
					'connect to server': 'connect to server',
					'Campaigns': 'Campaigns',
					'Workset complete!': 'Workset complete!',
					'Submit label': 'Submit label',
					'Request new workset': 'Request new workset',
					'Diff for revision $1': 'Diff for revision $1',
					'No difference': 'No difference', // between revisions
					'review': 'review', // 'review' a workset
					'open': 'open', // 'open' a workset
					'\'$1\' not completed.  Submit anyway?': '\'$1\' not completed.  Submit anyway?',
					'fullscreen': 'fullscreen'
				},
				es: {
					'date-format': "%d-%m-%Y",
					'Review': 'Revisar',
					'Workset':'Grupo',
					'Save': 'Guardar',
					'request workset': 'Solicitar grupo de tareas',
					'connect to server': 'Conectar al servidor',
					'Campaigns': 'Campañas',
					'Workset complete!': '¡Grupo de tareas finalizado!',
					'Submit label': 'Entrar etiqueta',
					'Request new workset': 'Solicitar nuevo grupo de tareas',
					'Diff for revision $1': 'Revisar diferencia $1',
					'No difference': 'No hay diferencia', // between revisions
					'review': 'revisar', // 'review' a workset
					'open': 'abrir', // 'open' a workset
					'\'$1\' not completed.  Submit anyway?': '\'$1\' incompleto.  ¿Entrar de todas formas?',
					'fullscreen': 'Pantalla completa'
				},
				fa: {
					'date-format': "%Y-%m-%d",
					'Review': 'بازبینی',
					'Workset': 'مجموعه کاری',
					'Save': 'ذخیره',
					'request workset': 'درخواست یک مجموعه',
					'connect to server': 'اتصال به سرور',
					'Campaigns': 'کمپین‌ها',
					'Workset complete!': 'مجموعه کامل شد!',
					'Submit label': 'برچسب را بفرست',
					'Request new workset': 'درخواست یک مجموعه جدید',
					'Diff for revision $1': 'تغییرات برای ویرایش $1',
					'No difference': 'بدون تغییر', // between revisions
					'review': 'بازبینی', // 'review' a workset
					'open': 'باز', // 'open' a workset
					'\'$1\' not completed.  Submit anyway?': '\'$1\' باز است. آیا مطمئنید؟',
					'fullscreen': 'تمام صفحه'
				},
				fr: {
					'date-format': "%d-%m-%Y",
					'Review': 'Relecture',
					'Workset': 'Ensemble de données',
					'Save': 'Sauvegarder',
					'request workset': 'Demander l\'ensemble de données',
					'connect to server': 'Connecter au serveur',
					'Campaigns': 'Campagnes',
					'Workset complete!': 'Ensemble de données terminé !',
					'Submit label': 'Soumettre l\'étiquette',
					'Request new workset': 'Demander un nouvel ensemble de données',
					'Diff for revision $1': 'Différence pour la révision $1',
					'No difference': 'Aucune différence', // between revisions
					'review': 'Relecture', // 'review' a workset
					'open': 'Ouvrir', // 'open' a workset
					'\'$1\' not completed.  Submit anyway?': '\'$1\' incomplet.  Soumettre quand même ?',
					'fullscreen': 'Plein écran'
				},
				he: {
					'date-format': "%Y-%m-%d",
					'Review': 'סקירה',
					'Workset': 'רשימת טיפול',
					'Save': 'שמירה',
					'request workset': 'בקשת רשימה לטיפול',
					'connect to server': 'התחברות לשרת',
					'Campaigns': 'מבצעים',
					'Workset complete!': 'רשימת הטיפול הושלמה!',
					'Submit label': 'שליחת סיווג',
					'Request new workset': 'בקשת רשימה טיפול חדשה',
					'Diff for revision $1': 'הבדל גרסאות עבור $1',
					'No difference': 'אין הבדל', // between revisions
					'review': 'סקירה', // 'review' a workset
					'open': 'פתיחה', // 'open' a workset
					'\'$1\' not completed.  Submit anyway?': '\'$1\' לא הושלם.  לשלוח בכל מקרה?',
					'fullscreen': 'מסך מלא'
				},
				id: {
					'date-format': "%d-%m-%Y",
					'Review': 'Tinjau',
					'Workset': 'Pekerjaan',
					'Save': 'Simpan',
					'request workset': 'minta pekerjaan',
					'connect to server': 'sambung ke server',
					'Campaigns': 'Kampanye',
					'Workset complete!': 'Pekerjaan selesai!',
					'Submit label': 'Kirim label',
					'Request new workset': 'Minta pekerjaan baru',
					'Diff for revision $1': 'Beda untuk revisi $1',
					'No difference': 'Tidak ada perbedaan', // between revisions
					'review': 'tinjau', // 'review' a workset
					'open': 'buka', // 'open' a workset
					'\'$1\' not completed.  Submit anyway?': '\'$1\' belum selesai. Lanjut mengirimkan?',
					'fullscreen': 'layar penuh'
				},
				it: {
					'date-format': "%d-%m-%Y",
					'Review': 'Valuta',
					'Workset': 'Workset',
					'Save': 'Salva',
					'request workset': 'Richiesta workset',
					'connect to server': 'Connessione al server',
					'Campaigns': 'Campagne',
					'Workset complete!': 'Workset completo!',
					'Submit label': 'Invia etichetta',
					'Request new workset': 'Richiedi un nuovo workset',
					'Diff for revision $1': 'Differenze per la modifica $1',
					'No difference': 'Nessuna differenza', // between revisions
					'review': 'Valuta', // 'review' a workset
					'open': 'Apri', // 'open' a workset
					'\'$1\' not completed.  Submit anyway?': '\'$1\' non completo. Inviare comunque?',
					'fullscreen': 'Schermo intero'
				},
				ja: {
					'date-format': "%Y年%m月%d日",
					'Review': 'レビュー',
					'Workset': '作業単位',
					'Save': '保存',
					'request workset': '作業単位を要請',
					'connect to server': 'サーバーに接続',
					'Campaigns': '作戦',
					'Workset complete!': '作業単位は完了しました！',
					'Submit label': '付箋を送信',
					'Request new workset': '新しい作業単位を要請する',
					'Diff for revision $1': '版$1の差分',
					'No difference': '差分なし', // between revisions
					'review': 'レビュー', // 'review' a workset
					'open': '開く', // 'open' a workset
					'\'$1\' not completed.  Submit anyway?': '\'$1\'は完了してません。本当に送信しますか？',
					'fullscreen': '全画面'
				},
				nl: {
					'date-format': "%d-%m-%Y",
					'Review': 'Beoordelen',
					'Workset': 'Werkset',
					'Save': 'Opslaan',
					'request workset': 'werkset opvragen',
					'connect to server': 'verbinden met server',
					'Campaigns': 'Campagnes',
					'Workset complete!': 'Werkset voltooid!',
					'Submit label': 'Label verzenden',
					'Request new workset': 'Nieuwe werkset opvragen',
					'Diff for revision $1': 'Verschil voor bewerking $1',
					'No difference': 'Geen verschil', // between revisions
					'review': 'beoordelen', // 'review' a workset
					'open': 'openen', // 'open' a workset
					'\'$1\' not completed.  Submit anyway?': '\'$1\' niet voltooid.  Toch verzenden?',
					'fullscreen': 'fullscreen'
				},
				pt: {
					'date-format': "%d-%m-%Y",
					'Review': 'Revisar',
					'Workset': 'Grupo',
					'Save': 'Salvar',
					'request workset': 'solicitar um grupo de tarefas',
					'connect to server': 'conectar ao servidor',
					'Campaigns': 'Campanhas',
					'Workset complete!': 'Conjunto de trabalho concluí­do!',
					'Submit label': 'Submeter o rótulo',
					'Request new workset': 'Solicitar um novo grupo de tarefas',
					'Diff for revision $1': 'Diferenças para a revisão $1',
					'No difference': 'Nenhuma diferença', // between revisions
					'review': 'revisar', // 'review' a workset
					'open': 'abrir', // 'open' a workset
					'\'$1\' not completed.  Submit anyway?': '\'$1\' não foi concluído. Submeter mesmo assim?',
					'fullscreen': 'tela cheia'
				},
				ru: {
					'date-format': "%d-%m-%Y",
					'Review': 'Проверка',
					'Workset': 'Рабочий набор',
					'Save': 'Сохранить',
					'request workset': 'Запросить рабочий набор',
					'connect to server': 'Установить соединение с сервером',
					'Campaigns': 'Кампании',
					'Workset complete!': 'Рабочий набор готов!',
					'Submit label': 'Отправить пометку',
					'Request new workset': 'Запросить новый рабочий набор',
					'Diff for revision $1': 'Diff для ревизии $1',
					'No difference': 'Различий нет', // between revisions
					'review': 'проверка', // 'review' a workset
					'open': 'открыть', // 'open' a workset
					'\'$1\' not completed.  Submit anyway?': '\'$1\' не готово.  Отправить всё равно?',
					'fullscreen': 'полный экран'
				},
				tr: {
					'date-format': "%Y-%m-%d",
					'Review': 'İncele',
					'Workset': 'İş kümesi',
					'Save': 'Kaydet',
					'request workset': 'iş kümesi iste',
					'connect to server': 'sunucuya bağlan',
					'Campaigns': 'Girişimler',
					'Workset complete!': 'İş kümesi tamamlandı!',
					'Submit label': 'Etiketi sun',
					'Request new workset': 'Yeni iş kümesi iste',
					'Diff for revision $1': '$1 değisikliği için diff',
					'No difference': 'Fark yoktur', // between revisions
					'review': 'incele', // 'review' a workset
					'open': 'açık', // 'open' a workset
					'\'$1\' not completed.  Submit anyway?': '\'$1\' tamamlanmadı. Genede sunulsun mu?',
					'fullscreen': 'tam ekran'
				},
				uk: {
					'date-format': "%Y-%m-%d",
					'Review': 'Перевірка',
					'Workset': 'Робочий набір',
					'Save': 'Зберегти',
					'request workset': 'запитати робочий набір',
					'connect to server': 'під\'єднатись до сервера',
					'Campaigns': 'Кампанії',
					'Workset complete!': 'Робочий набір готовий!',
					'Submit label': 'Надіслати мітку',
					'Request new workset': 'Запитати новий робочий набір',
					'Diff for revision $1': 'Різниця для версії $1',
					'No difference': 'Немає різниці', // between revisions
					'review': 'перевірити', // 'review' a workset
					'open': 'відкрити', // 'open' a workset
					'\'$1\' not completed.  Submit anyway?': '\'$1\' не готовий.  Усе одно надіслати?',
					'fullscreen': 'повний екран'
				}
			}
		}
	};
})(jQuery);
