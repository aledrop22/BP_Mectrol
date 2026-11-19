from itemadapter import ItemAdapter


class ScrapyBpMectrolPipeline:
    def process_item(self, item, spider):
        adapter = ItemAdapter(item)

        # Normalizar campos vazios
        for field in adapter.fields():
            if not adapter.get(field):
                adapter[field] = ''

        # Normalizar urgência para maiúsculas
        urgencia = adapter.get('urgencia', 'NORMAL')
        adapter['urgencia'] = str(urgencia).upper()

        return item
