from config import API_KEY
import requests

def retrieve_json_from_google(coordinates, API_KEY=API_KEY):
    #Turn the dataframe into numpy array of lat/lng pairs
    long_lat_values = coordinates
    length = len(long_lat_values)
    #print long_lat_values
    #print length


    print "Breaking lat/lng into 100 pairs per chunk for Google API"
    # Iterate through every 100 index on lat/lng pairs
    # Create a list of string consisting of lat and lng pairs that fits the API requirement:
    # chunks = ['lat,lng|lat,lng|lat,lng|...', 'lat,lng|lat,lng|lat,lng|...', 'lat,lng|lat,lng|lat,lng|...']
    chunks = []
    for i in range(0, length, 100):
        chunk = long_lat_values[i:i+100]

        #GOOGLE API Formatting: lat,lng| lat,lng| .....
        chunk = ["%s,%s"%(str(x[0]), str(x[1])) for x in chunk]
        chunk = "|".join(chunk)
        chunks.append(chunk)

    #print chunks

    print "GOOGLE API Feeding"
    #Iterate through chunks
    #for each chunk, GET response from google api and concatenate to smoothened_data
    url = "https://roads.googleapis.com/v1/snapToRoads"
    smoothened_data = []
    last_count = 0

    for i in range(0, len(chunks)):

        parameters= {
            'path': chunks[i],
            'key': API_KEY,
            'interpolate': True
        }

        response = requests.get(url, params=parameters)

        ##Prevent rate limiting: 50 requests per second
        #Pausing the program before every 50th request
        if (i+1)%50 == 0:
            time.sleep(1)

        ## Success case:
        if response.status_code == 200:
            results = response.json()
	    #print "print results"
            #print results

            if results.has_key('snappedPoints'):
                # if results is a dictionary with key 'snappedPoints'
                # results contains the smoothened Points returned from google
                results = results['snappedPoints']

                ##Updating originalIndex for each chunk to ensure continuity, using _lastIndex to keep track
                if i == 0:
                    last_count =list(filter( lambda x: x.has_key('originalIndex'), results))[-1]['originalIndex']
                else:
                    _lastIndex = 0
                    for result in results:
                        if result.has_key('originalIndex'):
                            result['originalIndex'] = result['originalIndex'] + last_count + 1
                            _lastIndex = result['originalIndex']

                    last_count = _lastIndex
                print "Chunk %s contains %s, Google returns %s "%(i, chunks[i].count('|')+1,len(results))
            else:
                #If results doesn't have snappedPoints as key
                results = []

            # concatenate list to bigger list smoothened_data
            smoothened_data = smoothened_data + results

        elif response.status_code == 429:
            ## handling rate-limited event
            error = response.json()
            return [], error['error']['message']

    #print "Smoothened Data"
    #print smoothened_data

    if len(smoothened_data) == 0: message = "Google Snap API did not return any values"
    else: message ="GOOGLE API SUCCESS, %s data returned"% len(smoothened_data)

    return smoothened_data, message
coordinates = ((-35.27801,149.12958), (-35.28032,149.12907), (-35.28099,149.12929), (-35.28144,149.12984), (-35.28194,149.13003), (-35.28282,149.12956), (-35.28302,149.12881), (-35.28473,149.12836))
print retrieve_json_from_google(coordinates)
