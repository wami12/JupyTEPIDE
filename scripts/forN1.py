#!/opt/anaconda/anaconda3/envs/python34/bin/python
import snappy
import sys


def main(x):
    p = snappy.ProductIO.readProduct(x)
    metadata = p.getMetadataRoot()
    element = metadata.getElement('SPH')
    fflat = element.getAttribute('FIRST_FIRST_LAT').getDataElems()[0] * 1e-6
    fflon = element.getAttribute('FIRST_FIRST_LONG').getDataElems()[0] * 1e-6
    fllat = element.getAttribute('FIRST_LAST_LAT').getDataElems()[0] * 1e-6
    fllon = element.getAttribute('FIRST_LAST_LONG').getDataElems()[0] * 1e-6
    lflat = element.getAttribute('LAST_FIRST_LAT').getDataElems()[0] * 1e-6
    lflon = element.getAttribute('LAST_FIRST_LONG').getDataElems()[0] * 1e-6
    lllat = element.getAttribute('LAST_LAST_LAT').getDataElems()[0] * 1e-6
    lllon = element.getAttribute('LAST_LAST_LONG').getDataElems()[0] * 1e-6
    return ";%f;%f;%f;%f;%f;%f;%f;%f;" % (fflon, fflat, fllon, fllat, lflon, lflat, lllon, lllat)


if __name__ == '__main__':
    print (main(sys.argv[1]))
