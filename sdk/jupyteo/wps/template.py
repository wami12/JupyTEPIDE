from pywps import Process, ComplexOutput, ComplexInput, Format


class MyProcess(Process):
    def __init__(self):
        '''
        Description of inputs and outputs goes here.
        '''
        inputs = [ComplexInput('layer', 'Layer', supported_formats=[Format('application/gml+xml')])]
        outputs = [ComplexOutput('out', 'Referenced Output', supported_formats=[Format('application/gml+xml')])]
        super(MyProcess, self).__init__(
            self._handler,
            identifier='identifier',
            title='Process title',
            abstract='Process Abstract',
            inputs=inputs,
            outputs=outputs,
            store_supported=True,
            status_supported=True
        )

    def _handler(self, request, response):
        '''
        Processing goes here. For the information about handling inputs and outputs go to pyWPS web page
        '''

        pass