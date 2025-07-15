package rebootedmvp.service;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.function.Function;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import rebootedmvp.HasID;
import rebootedmvp.InfoContainer;
import rebootedmvp.dto.NewDTO;

/**
 * This is an interface for a service object. It denotes the meaningful actions
 * that can be taken from this point. 'T' should be the type of the highest
 * level of abstraction that the implementation might have to consider (now
 * called the higher level). For example, T in CourseService should be type
 * Course. 'K' should be the type one level lower than T (now called the lower
 * level). For example, if T is of type Course then 'K' should be of
 * type Module. Types 'R' and 'Q' mus be the new DTO types of 'T' and 'K'
 * repectively.
 */
public abstract class ServiceType<T extends InfoContainer<K>, R extends NewDTO, K extends HasID, Q extends NewDTO> {

    private final Map<Long, T> datas = new ConcurrentHashMap<>();
    private final AtomicLong idGenerator = new AtomicLong(0);

    /**
     * Returns a list of all the elements within all of the T's. For example, in
     * CourseService, this should return a list of every module in every course
     */
    public List<K> findAll() {
        Collection<T> data = datas.values();

        return data.stream()
                .map((var elem) -> {
                    return elem.getAll();
                }).flatMap(List::stream).toList();
    }

    /**
     * Returns a list of all the elements within the 'T' with id 'id'. Throws:
     * ResponseStatusException if no course can be found with that id.
     */
    public List<K> getById(Long id) {
        T data = datas.get(id);
        if (data == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Nothing was found with that id");
        }
        return data.getAll();
    }

    /**
     * Returns the element within the 'T' with id 'id1' that has id 'id2'.
     * Throws: ResponseStatusException if no course can be found with that id.
     */
    public K getById(Long id1, Long id2) {
        T data = datas.get(id1);
        if (data == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Nothing was found with that id");
        }
        return data.getAll()
                .stream()
                .filter(elem -> Objects.equals(elem.getId(), id2))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Nothing was found with that id"));
    }

    /**
     * Adds a new lower element to the collection of higher elements given by id
     * 'highId'
     * 
     * @param highId  - The id of the higher level collection to add the ew element
     *                to
     * @param newData - A lower level newDTO of the information to add
     * @return - the id of the new, added element
     */
    public Long addNew(Long highId, Q newData) {
        if (newData.getTitle() == null || newData.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("The title must be supplied in the DTO");
        }

        Long newId = idGenerator.getAndIncrement();
        T highLevel = datas.get(highId);

        K smallerGroup = highLevel.create(newId, newData.getTitle(), newData.getBody());
        highLevel.addSub(smallerGroup);

        return newId;
    }

    /**
     * Creates a new higher level element.
     * 
     * @param newData
     * @param constructor - A constructor for the new element. typically will just
     *                    be an implementation of the higher element's constructor
     *                    (i.e. RosterEntityImpl::new for RosterService)
     * @return - the id of the created element
     */
    public Long addToHigh(R newData, Function<R, T> constructor) {
        if (newData.getTitle() == null || newData.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("The title must be supplied in the DTO");
        }

        Long newId = idGenerator.getAndIncrement();
        T newObject = constructor.apply(newData); // 👈 uses lambda to create the object
        datas.put(newId, newObject);
        return newId;
    }

    /**
     * Updates the lower element with id 'lowId' that is part of the higher
     * collection with id 'highId' using the data in 'updateDTO'. Throws an HTML
     * NOT_FOUND exception if there is not an element in a collection labeled
     * 'highId' with label 'lowId'(i.e. if the element being looked for does not
     * exist).
     * 
     * @param highId    - The id of the higher lever collection
     * @param lowId     - The id of the lowe level collection
     * @param updateDTO - A lower-level DTO of the information to replace
     */
    public void update(Long highId, Long lowId, Q updateDTO) throws ResponseStatusException {
        T data = datas.get(highId);
        K toUpdate = data.getAll()
                .stream()
                .filter(elem -> Objects.equals(elem.getId(), lowId))
                .findAny()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Nothing was found with that id"));

        if (updateDTO.getTitle() != null && !updateDTO.getTitle().trim().isEmpty()) {
            toUpdate.setTitle(updateDTO.getTitle().trim());
        }
        if (updateDTO.getBody() != null) {
            toUpdate.setBody(updateDTO.getBody());
        }
    }

    /**
     * Deletes the element with id 'lowId' from the collection given by the id
     * 'highId'
     * 
     * @param highId - The
     * @param lowId
     * @return - True if the deletion was successful (i.e. if the specified element
     *         existed to be deleted)
     */
    public boolean delete(Long highId, Long lowId) {
        T data = datas.get(highId);
        return data.removeSub(lowId);
    }
}
