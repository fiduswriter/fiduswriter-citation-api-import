=====
FidusWriter-Citation-API-import
=====

FidusWriter-Citation-API-import is a Fidus Writer plugin to allow for import of
citations from external sources via API.

Currently these citation sources are supported: Worldcat, Sowiport, Crossref,
Datacite.


Note For Developers:
-----------
If you are not a developer and only want to use the plugin skip this part and go directly to Installation section.

Developers of the plugin should follow this steps instead of the regular Installation. This installs the plugin as a
folder in FidusWriter and can be extended and get debugged similar to main FidusWriter code.

1. Clone the plugin folder from here to in a directory in your system.
 
2. Link the app folder of the plugin directly into the main fiduswriter installation. The pluginfolder is for example "fiduswriter/citation-api-import" for this plugin. (Using "ln" command in ubuntu)

3. By each change of the plugin by extension perform a "manage.py transpile" to take the java script code changes in effect.
 
4. Add "citation-api-import" to your INSTALLED_APPS setting in the
   configuration.py file like this::

    INSTALLED_APPS += (
        ...
        'citation-api-import',
    )

5. Run `python manage.py transpile` to create the needed JavaScript files.

6. (Re)start your Fidus Writer server


Installation
-----------

1. Install Fidus Writer if you haven't done so already.

2. Within the virtual environment set up for your Fidus Writer instance,
   running `pip install fiduswriter-citation-api-import`

3. Add "citation-api-import" to your INSTALLED_APPS setting in the
   configuration.py file like this::

    INSTALLED_APPS += (
        ...
        'citation-api-import',
    )

4. Run `python manage.py transpile` to create the needed JavaScript files.

5. (Re)start your Fidus Writer server


Credits
-----------

This plugin has been developed by the `Opening Scholarly Communications in the Social Sciences (OSCOSS) <http://www.gesis.org/?id=10714>`_ project, financed by the German Research Foundation (DFG) and executed by the University of Bonn and GESIS – Leibniz Institute for the Social Sciences.

Lead Developer: `Niloofar Azizi <https://github.com/NiloofarAzizi>`_
