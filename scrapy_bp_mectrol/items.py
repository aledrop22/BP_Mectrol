import scrapy


class BPMectrolItem(scrapy.Item):
    bp = scrapy.Field()
    cliente = scrapy.Field()
    razao_social = scrapy.Field()
    nota_fiscal = scrapy.Field()
    filial = scrapy.Field()
    vendedor = scrapy.Field()
    chegada = scrapy.Field()
    prazo = scrapy.Field()
    atraso = scrapy.Field()
    status = scrapy.Field()
    laudo = scrapy.Field()
    urgencia = scrapy.Field()
    alerta_email = scrapy.Field()
    diametro_primitivo = scrapy.Field()
    passo = scrapy.Field()
    comp_total = scrapy.Field()
    precisao = scrapy.Field()
    defeito = scrapy.Field()
