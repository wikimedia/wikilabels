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
				}
			}
		}
	};
})(jQuery);
