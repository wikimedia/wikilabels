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
				az: {

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
			}
		}
	};
})(jQuery);
